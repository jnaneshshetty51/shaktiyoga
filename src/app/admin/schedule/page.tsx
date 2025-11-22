export default function AdminSchedulePage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-serif text-3xl text-gray-800">Class Schedule</h1>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-gray-700 transition-colors">
                    Add Class
                </button>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-8">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                    <div key={day} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center font-bold text-gray-800 hover:bg-gray-50 cursor-pointer">
                        {day}
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">6:00 AM - 7:00 AM IST</div>
                        <div className="text-xl font-bold text-gray-800">Vinyasa Flow</div>
                        <div className="text-sm text-gray-600">Instructor: Sarah Jenkins</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">24</div>
                            <div className="text-xs text-gray-500">Registered</div>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Edit</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">7:30 AM - 8:30 AM IST</div>
                        <div className="text-xl font-bold text-gray-800">Hatha Yoga</div>
                        <div className="text-sm text-gray-600">Instructor: Raj Mehta</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">18</div>
                            <div className="text-xs text-gray-500">Registered</div>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Edit</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center opacity-60">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">5:00 PM - 6:00 PM IST</div>
                        <div className="text-xl font-bold text-gray-800">Beginner Yoga</div>
                        <div className="text-sm text-gray-600">Instructor: Sarah Jenkins</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800">0</div>
                            <div className="text-xs text-gray-500">Cancelled</div>
                        </div>
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
