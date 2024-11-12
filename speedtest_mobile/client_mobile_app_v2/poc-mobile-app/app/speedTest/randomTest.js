const runDownloadSpeedTest = async () => {


    console.log("starting it")
    const startTime = Date.now();
    let downloadedBytes = 0;

    try {

      const fileUrl = 'https://plus.unsplash.com/premium_photo-1680740103993-21639956f3f0?q=80&w=3988&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
      const response = await fetch(fileUrl);


      const reader = response.body.getReader();




      // Read data for 3 seconds
      const endTime = startTime + 3000; // 3 seconds from now
      let currentTime = Date.now();

      while (currentTime < endTime) {
        const { done, value } = await reader.read();
        if (done) break;

        // Accumulate the downloaded bytes
        downloadedBytes += value.length;

        // Update current time for the next iteration
        currentTime = Date.now();
      }

      // Calculate download time (should be around 3 seconds)
      const durationInSeconds = (currentTime - startTime) / 1000;

      // Calculate download speed in Mbps (Megabits per second)
      const fileSizeInMegabits = (downloadedBytes * 8) / (1024 * 1024); // Convert bytes to Megabits
      const downloadSpeed = fileSizeInMegabits / durationInSeconds; // Mbps

      console.log("Speed test results: " + downloadSpeed.toFixed(2))
      return downloadSpeed.toFixed(2);

    } catch (error) {

        console.log("errrrrr " , error);
       
    } finally {
       
    }
  };


  export default runDownloadSpeedTest;