'use client';

import { useState, useTransition } from "react";
import { Button, Card, Input } from "@repo/ui";
import { updateGlobalSettings } from "./actions";


interface SettingsFormProps {
    group: string;
    children: React.ReactNode;
}

export function SettingsForm({ group, children }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        formData.append('group', group);

        startTransition(async () => {
            const result = await updateGlobalSettings(formData);
            if (result.success) {
                alert(result.message); // Replace with Toast in production
            } else {
                alert(result.message);
            }
        });
    };

    return (
        <form action={handleSubmit}>
            <div className="space-y-6">
                {children}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="submit" disabled={isPending} className="rounded-xl px-6">
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
