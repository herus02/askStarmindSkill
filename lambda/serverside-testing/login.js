module.exports = function(express, alexaAppServerObject) {
  express.use('/login',function(req,res) {
    console.log("fake login request received");
    res.send("Imagine this is a dynamic server-side login action");
  });
};