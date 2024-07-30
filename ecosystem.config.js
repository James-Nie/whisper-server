module.exports = {
    apps: [{
      name: "nest",
      script: "./dist/main.js",
      instances  : 2,
      exec_mode  : "cluster",
      env_local: {
        NODE_ENV: "local"
      },
      env_dev: {
        NODE_ENV: "dev"
      },
      env_pre: {
        NODE_ENV: "pre"
      },
      env_prod: {
        NODE_ENV: "prod"
      }
    }]
  }