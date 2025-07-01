import { exec } from 'child_process';

const port = 5001; // Change this to your port

// Function to kill process on port for Windows
function killPortWindows(pid) {
  exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error killing process ${pid}:`, err);
      return;
    }
    console.log(`Process ${pid} killed successfully.`);
  });
}

// Function to kill process on port for Unix/macOS
function killPortUnix(pid) {
  exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error killing process ${pid}:`, err);
      return;
    }
    console.log(`Process ${pid} killed successfully.`);
  });
}

// Detect platform and find + kill process using the port
if (process.platform === 'win32') {
  // Windows
  exec(`netstat -ano | findstr :${port}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error finding process on port ${port}:`, err);
      return;
    }
    if (!stdout) {
      console.log(`No process is using port ${port}`);
      return;
    }

    // Parse PID from netstat output
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      console.log(`Killing process with PID ${pid} on port ${port}`);
      killPortWindows(pid);
    }
  });
} else {
  // Unix/Linux/macOS
  exec(`lsof -t -i :${port}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error finding process on port ${port}:`, err);
      return;
    }
    if (!stdout) {
      console.log(`No process is using port ${port}`);
      return;
    }

    const pids = stdout.trim().split('\n');
    for (const pid of pids) {
      console.log(`Killing process with PID ${pid} on port ${port}`);
      killPortUnix(pid);
    }
  });
}
