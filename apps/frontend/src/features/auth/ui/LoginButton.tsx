import { UserRole } from '../model/authTypes';

type LoginButtonProps = {
  role: UserRole;
  label: string;
  onLogin: (role: UserRole) => void;
  disabled?: boolean;
};

export function LoginButton({ role, label, onLogin, disabled = false }: LoginButtonProps) {
  return (
    <button className="secondary-button" type="button" onClick={() => onLogin(role)} disabled={disabled}>
      {label}
    </button>
  );
}
