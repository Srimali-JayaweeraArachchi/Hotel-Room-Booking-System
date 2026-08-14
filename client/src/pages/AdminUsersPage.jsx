import { useCallback, useEffect, useState } from 'react';
import { getManagedUsers, updateManagedUserRole } from '../api/userApi.js';
import { getApiErrorMessage } from '../utils/apiError.js';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async (nextFilters = filters) => {
    setError('');
    try { setUsers(await getManagedUsers(nextFilters)); }
    catch (requestError) { setError(getApiErrorMessage(requestError)); }
  }, [filters]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitSearch(event) { event.preventDefault(); await load(filters); }
  async function changeRole(user, role) {
    setUpdatingId(user.id); setError(''); setMessage('');
    try {
      const updated = await updateManagedUserRole(user.id, role);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage(`${updated.name} is now assigned as ${updated.role}.`);
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setUpdatingId(null); }
  }

  return (
    <main className="admin-page user-management-page">
      <section className="admin-heading"><div><p className="eyebrow">Administration</p><h1>User management</h1><p>Assign registered customer accounts as hotel staff without accessing the project terminal.</p></div><div className="inventory-summary"><strong>{users.filter((user) => user.role === 'staff').length}</strong><span>Staff shown</span><strong>{users.length}</strong><span>Accounts shown</span></div></section>
      {message && <div className="success-alert" role="status">{message}</div>}
      {error && <div className="form-alert" role="alert">{error}</div>}
      <form className="booking-admin-search" onSubmit={submitSearch}>
        <input aria-label="Search users" onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search by name or email" value={filters.search} />
        <select aria-label="Filter by role" onChange={(event) => setFilters({ ...filters, role: event.target.value })} value={filters.role}><option value="">All roles</option><option value="guest">Guests</option><option value="staff">Staff</option><option value="admin">Administrators</option></select>
        <button className="button button-primary" type="submit">Search</button>
      </form>
      <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>User</th><th>Current role</th><th>Registered</th><th>Staff access</th></tr></thead><tbody>
        {users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><span className="table-subtext">{user.email}</span></td><td><span className={`status-pill user-role-${user.role}`}>{user.role}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td>{user.role === 'admin' ? <span className="table-subtext">Protected administrator</span> : <button className={`button button-small ${user.role === 'staff' ? 'button-quiet' : 'button-primary'}`} disabled={updatingId === user.id} onClick={() => changeRole(user, user.role === 'staff' ? 'guest' : 'staff')} type="button">{updatingId === user.id ? 'Updating...' : user.role === 'staff' ? 'Remove staff access' : 'Make staff'}</button>}</td></tr>)}
        {!users.length && <tr><td colSpan="4">No matching accounts found.</td></tr>}
      </tbody></table></div>
    </main>
  );
}

export default AdminUsersPage;
