export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Account overview and personal finance preferences.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Name</p>
          <p className="font-medium">Pradnyesh</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Risk appetite</p>
          <p className="font-medium">Moderate</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Financial score</p>
          <p className="font-medium text-success">88 / 100</p>
        </div>
      </div>
    </div>
  );
}
