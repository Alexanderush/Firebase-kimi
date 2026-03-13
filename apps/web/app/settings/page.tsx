export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">Update your agency profile and billing preferences.</p>
            <div className="bg-white rounded-lg border p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="Your Agency" disabled />
                </div>
                <button className="bg-gray-100 text-gray-400 px-4 py-2 rounded-md cursor-not-allowed">Save Changes</button>
            </div>
        </div>
    )
}
