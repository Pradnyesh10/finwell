export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Application behavior and alert controls.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm">EMI due reminders</span>
          <input type="checkbox" defaultChecked />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">Stress alert notifications</span>
          <input type="checkbox" defaultChecked />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">Weekly report email</span>
          <input type="checkbox" />
        </label>
      </div>
    </div>
  );
}
