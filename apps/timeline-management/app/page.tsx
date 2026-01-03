import { AppHeader } from './components/AppHeader';
import { PublicTrackingClient } from './PublicTrackingClient';

export default function PublicTrackingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AppHeader />

            <main>
                <PublicTrackingClient />
            </main>
        </div>
    );
}
