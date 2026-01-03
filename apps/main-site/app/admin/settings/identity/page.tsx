import { Card, Input } from "@repo/ui";
import { getGlobalSettings } from "../actions";
import { SettingsForm } from "../SettingsForm";

export const dynamic = 'force-dynamic';

export default async function IdentitySettingsPage() {
    const settings = await getGlobalSettings('identity');
    const values = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => ({ ...acc, [curr.key]: curr.value }), {});

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Brand Identity</h1>
                <p className="text-gray-500 mt-2">Manage how your organization appears to users.</p>
            </div>

            <Card className="p-0 overflow-hidden bg-white rounded-3xl shadow-md border border-gray-100">
                <div className="p-8">
                    <SettingsForm group="identity">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name</label>
                                <Input
                                    name="brand_name"
                                    defaultValue={values['brand_name'] || ''}
                                    placeholder="e.g. Kreasibu Corp"
                                    className="bg-gray-50 border-gray-200 rounded-xl"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                                <Input
                                    name="brand_tagline"
                                    defaultValue={values['brand_tagline'] || ''}
                                    placeholder="e.g. Innovating the Future"
                                    className="bg-gray-50 border-gray-200 rounded-xl"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Description</label>
                                <textarea
                                    name="brand_description"
                                    defaultValue={values['brand_description'] || ''}
                                    placeholder="Short description of your organization..."
                                    className="w-full min-h-[100px] p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                                <Input
                                    name="contact_email"
                                    type="email"
                                    defaultValue={values['contact_email'] || ''}
                                    placeholder="admin@example.com"
                                    className="bg-gray-50 border-gray-200 rounded-xl"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL</label>
                                <Input
                                    name="brand_logo_url"
                                    defaultValue={values['brand_logo_url'] || ''}
                                    placeholder="https://..."
                                    className="bg-gray-50 border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </SettingsForm>
                </div>
            </Card>
        </div>
    );
}
