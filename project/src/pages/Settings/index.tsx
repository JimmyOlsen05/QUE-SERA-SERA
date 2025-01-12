import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';

export default function Settings() {
  return (
    <div className="mx-auto space-y-6 max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <ProfileSettings />
      <SecuritySettings />
    </div>
  );
}