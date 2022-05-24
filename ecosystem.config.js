module.exports = {
    apps : [
        {
          name: "Chat together",
          script: "dist/index.js",
          instances : "max",
          exec_mode : "cluster",
          env: {
            "NODE_ENV": "production",
          }
        }
    ]
  }