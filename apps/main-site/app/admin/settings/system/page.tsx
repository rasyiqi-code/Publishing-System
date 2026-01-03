import { Card, Input } from "@repo/ui";
import { getGlobalSettings } from "../actions";
import { SettingsForm } from "../SettingsForm";

export const dynamic = 'force-dynamic';

export default async function SystemSettingsPage() {
    const settings = await getGlobalSettings('system');
    const values = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => ({ ...acc, [curr.key]: curr.value }), {});

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
                <p className="text-gray-500 mt-2">Technical settings and maintenance controls.</p>
            </div>

            <Card className="p-0 overflow-hidden bg-white rounded-3xl shadow-md border border-gray-100">
                <div className="p-8">
                    <SettingsForm group="system">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <h3 className="text-yellow-800 font-bold mb-1">Maintenance Mode</h3>
                                    <p className="text-yellow-700 text-sm mb-4">
                                        When enabled, only admins can access the site. Public users will see a maintenance page.
                                    </p>
                                    <select
                                        name="maintenance_mode"
                                        defaultValue={values['maintenance_mode'] || 'off'}
                                        className="w-full p-2.5 rounded-xl border border-yellow-200 bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                                    >
                                        <option value="off">Disabled (Site is Live)</option>
                                        <option value="on">Enabled (Maintenance Page)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-gray-800 font-bold mb-1">Debug Mode</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Enables detailed error logging and dev tools overlay. Do not enable in production.
                                    </p>
                                    <select
                                        name="debug_mode"
                                        defaultValue={values['debug_mode'] || 'off'}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-gray-400 outline-none"
                                    >
                                        <option value="off">Disabled</option>
                                        <option value="on">Enabled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">System Announcement Banner</label>
                                <textarea
                                    name="system_announcement"
                                    defaultValue={values['system_announcement'] || ''}
                                    placeholder="Enter a message to display at the top of every page..."
                                    className="w-full min-h-[80px] p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty to hide.</p>
                            </div>
                        </div>
                    </SettingsForm>
                </div>
            </Card>
        </div>
    );
}
