self.addEventListener("message", (e) => {
  const startTime = new Date().getTime();

  console.log("From main.js:", e.data);
});
