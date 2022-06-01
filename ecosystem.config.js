module.exports = {
    apps : [
        {
          name: "chat-together",
          script: "dist/index.js",
          instances : "1",
          exec_mode : "cluster",
          env: {
            "NODE_ENV": "production",
          }
        }
    ]
  }