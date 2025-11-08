
export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Register</h2>
      <p className="mb-4 text-gray-700">
        Please select your role and register to access Medicare services.
      </p>
      <form className="space-y-4">
        <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500" required>
          <option value="">Select Role</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Username"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
