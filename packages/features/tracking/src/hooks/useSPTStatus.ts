import { DataPoint, Phase, PHASES_CONFIG, SPTData, PhaseStatus } from "../types";

export interface SPTState {
    phases: Phase[];
    overallProgress: number;
    currentActivePhaseId: number | null;
}

export const useSPTStatus = (data: SPTData): SPTState => {
    // Deep copy config to avoid mutation
    const phases = JSON.parse(JSON.stringify(PHASES_CONFIG)) as Phase[];

    // Helper to check if a specific point is filled
    const isFilled = (id: number) => {
        const point = data[id];
        return point && point.value !== null && point.value !== "" && point.value !== undefined;
    };

    let overallCompletedPoints = 0;
    let totalRequiredPoints = 0; // Only counting required points globally or per phase? 
    // For now let's just count total points used in logic.

    // 1. Evaluate Phase 1 Status
    // Rule: Lock "Menunggu Pembayaran" until DP Date (Point 8) is filled.
    const dpFilled = isFilled(8);
    if (!dpFilled) {
        phases[0].status = 'active'; // Waiting for DP
        // Lock all subsequent
    } else {
        phases[0].status = 'completed';
        phases[1].status = 'active'; // Phase 2 starts
        phases[2].status = 'active'; // Phase 3 runs parallel
    }

    // 2. Evaluate Phase 2 (Creative)
    // Exit Condition: ACC Final (Point 25)
    if (phases[1].status === 'active') {
        if (isFilled(25)) {
            phases[1].status = 'completed';
        }
        // Revisions logic would be dynamic, simpler here: if started but not ACC, it's active/revision.
    }

    // 3. Evaluate Phase 3 (Legal)
    // Runs parallel. Completed when ISBN (16) is present (if required).
    // Assuming ISBN is mandatory for this flow.
    if (phases[2].status === 'active') {
        if (isFilled(16)) {
            phases[2].status = 'completed';
        }
    }

    // 4. Evaluate Phase 4 (Production)
    // Entry: Phase 2 & 3 Completed AND Full Payment (Point 9)
    // Lock: Naik Cetak (26) disabled if Payment (9) not filled.
    const phase2Done = phases[1].status === 'completed';
    const phase3Done = phases[2].status === 'completed'; // or skipped if not needed
    const paymentDone = isFilled(9);

    if (phase2Done && phase3Done) {
        if (!paymentDone) {
            phases[3].status = 'warning'; // Ready for print but not paid
            phases[3].isLocked = true; // Hard lock
        } else {
            phases[3].status = 'active';
            phases[3].isLocked = false; // Unlocked
        }
    }

    if (phases[3].status === 'active' && isFilled(26)) {
        // Naik Cetak filled means production started/done? 
        // Usually production takes time. Let's say completed for tracking flow if "Naik Cetak" date exists.
        phases[3].status = 'completed';
        phases[4].status = 'active';
    }

    // 5. Evaluate Phase 5 (Delivery)
    if (phases[4].status === 'active') {
        if (isFilled(27)) {
            phases[4].status = 'completed';
        }
    }

    // Calculate Progress per Phase
    phases.forEach(phase => {
        const totalPoints = phase.dataPoints.length;
        let completed = 0;
        phase.dataPoints.forEach(pid => {
            if (isFilled(pid)) completed++;
        });
        phase.progress = Math.round((completed / totalPoints) * 100);

        overallCompletedPoints += completed;
        totalRequiredPoints += totalPoints;
    });

    return {
        phases,
        overallProgress: Math.round((overallCompletedPoints / totalRequiredPoints) * 100),
        currentActivePhaseId: phases.find(p => p.status === 'active' || p.status === 'warning')?.id || null
    };
};
