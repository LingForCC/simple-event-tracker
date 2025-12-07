App({
  onLaunch() {
    // 小程序启动时执行
    console.log('简单事件追踪小程序启动')
  },
  
  globalData: {
    userInfo: null,
    // 存储事件记录的键名
    storageKey: 'eventRecords'
  }
})