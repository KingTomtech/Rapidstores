const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div className="max-w-2xl mx-auto card">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div><strong>Name:</strong> {user.name}</div>
      <div><strong>Phone:</strong> {user.phone}</div>
      <div><strong>Email:</strong> {user.email || 'Not provided'}</div>
    </div>
  );
};
export default Profile;
