import { useState } from 'react';

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5a15 15 0 0 1-2.2 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5c1 0 2-.2 2.9-.5" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  );
}

function PasswordInput({ id, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-input-wrap">
      <input {...inputProps} id={id} type={visible ? 'text' : 'password'} />
      <button aria-label={visible ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setVisible((current) => !current)} title={visible ? 'Hide password' : 'Show password'} type="button"><EyeIcon hidden={visible} /></button>
    </div>
  );
}

export default PasswordInput;
