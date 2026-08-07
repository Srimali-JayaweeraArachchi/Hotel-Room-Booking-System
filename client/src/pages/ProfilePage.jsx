import { useEffect, useState } from 'react';
import { changeCurrentPassword } from '../api/authApi.js';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function ProfilePage() {
  const { updateProfile, user } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => { setProfile({ name: user.name, email: user.email }); }, [user.email, user.name]);

  async function saveProfile(event) {
    event.preventDefault(); setSaving('profile'); setError(''); setProfileMessage('');
    try { await updateProfile(profile); setProfileMessage('Profile updated successfully.'); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setSaving(''); }
  }

  async function savePassword(event) {
    event.preventDefault(); setError(''); setPasswordMessage('');
    if (passwords.newPassword !== passwords.confirmPassword) { setError('New passwords do not match.'); return; }
    setSaving('password');
    try {
      await changeCurrentPassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password changed successfully.');
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setSaving(''); }
  }

  return (
    <main className="profile-page">
      <section className="profile-heading"><div><p className="eyebrow">{user.role} account</p><h1>Welcome, {user.name}.</h1><p>Manage your identity and account security.</p></div><span className="role-badge">{user.role}</span></section>
      {error && <div className="form-alert profile-alert" role="alert">{error}</div>}
      <section className="profile-grid account-settings-grid">
        <form className="profile-card settings-form" onSubmit={saveProfile}>
          <div><p className="eyebrow">Personal details</p><h2>Edit profile</h2></div>
          {profileMessage && <div className="success-alert" role="status">{profileMessage}</div>}
          <label>Full name<input autoComplete="name" minLength="2" onChange={(event) => setProfile({ ...profile, name: event.target.value })} required value={profile.name} /></label>
          <label>Email address<input autoComplete="email" onChange={(event) => setProfile({ ...profile, email: event.target.value })} required type="email" value={profile.email} /></label>
          <div className="readonly-account-row"><span>Account role</span><strong>{user.role}</strong></div>
          <button className="button button-primary" disabled={saving === 'profile'} type="submit">{saving === 'profile' ? 'Saving...' : 'Save profile'}</button>
        </form>
        <form className="profile-card settings-form" onSubmit={savePassword}>
          <div><p className="eyebrow">Account security</p><h2>Change password</h2></div>
          {passwordMessage && <div className="success-alert" role="status">{passwordMessage}</div>}
          <label>Current password<PasswordInput autoComplete="current-password" name="currentPassword" onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required value={passwords.currentPassword} /></label>
          <label>New password<PasswordInput autoComplete="new-password" minLength="8" name="newPassword" onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}" required value={passwords.newPassword} /></label>
          <label>Confirm new password<PasswordInput autoComplete="new-password" name="confirmPassword" onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required value={passwords.confirmPassword} /></label>
          <p className="field-hint">Use at least 8 characters with uppercase, lowercase, and a number.</p>
          <button className="button button-primary" disabled={saving === 'password'} type="submit">{saving === 'password' ? 'Changing...' : 'Change password'}</button>
        </form>
      </section>
    </main>
  );
}

export default ProfilePage;
