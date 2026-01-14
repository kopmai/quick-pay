export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: 'green' }}>✅ IT WORKS!</h1>
      <p>If you see this, the deployment is successful.</p>
      <p>Current Time: {new Date().toISOString()}</p>
    </div>
  );
}
