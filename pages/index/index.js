const app = getApp()

Page({
  data: {
    currentDate: '',
    currentMonth: '',
    currentYear: 0,
    days: [],
    eventRecords: {},
    today: '',
    selectedDate: '',
    stats: {
      successCount: 0,
      totalCount: 0,
      totalAllTimeCount: 0
    }
  },

  onLoad() {
    this.initCalendar()
    this.loadEventRecords()
  },

  onShow() {
    this.loadEventRecords()
  },

  onPullDownRefresh() {
    this.loadEventRecords()
    wx.stopPullDownRefresh()
  },

  // 初始化日历
  initCalendar() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const today = this.formatDate(now)
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      currentDate: today,
      today: today,
      selectedDate: today
    })
    
    this.generateCalendar(year, month)
  },

  // 生成日历数据
  generateCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const endDate = new Date(lastDay)
    // 修复：确保日历总是显示完整的星期，包括星期六
    const daysToAdd = lastDay.getDay() === 6 ? 0 : (6 - lastDay.getDay())
    endDate.setDate(endDate.getDate() + daysToAdd)
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = this.formatDate(d)
      const isCurrentMonth = d.getMonth() === month - 1
      const isToday = dateStr === this.data.today
      const dayRecord = this.data.eventRecords[dateStr]
      const hasRecord = dayRecord && Array.isArray(dayRecord) && dayRecord.length > 0
      const recordCount = hasRecord ? dayRecord.length : 0
      
      days.push({
        date: dateStr,
        day: d.getDate(),
        isCurrentMonth,
        isToday,
        hasRecord,
        recordCount,
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      })
    }
    
    this.setData({ days })
    this.calculateStats()
  },

  // 计算统计数据
  calculateStats() {
    const { eventRecords, currentYear, currentMonth } = this.data
    let successCount = 0
    let totalCount = 0
    let totalAllTimeCount = 0
    
    // 遍历当前月份的所有记录
    Object.keys(eventRecords).forEach(dateStr => {
      const date = new Date(dateStr)
      const dayRecords = eventRecords[dateStr]
      if (Array.isArray(dayRecords) && dayRecords.length > 0) {
        // 计算所有时间的总打卡次数
        totalAllTimeCount += dayRecords.length
        
        // 计算当前月份的统计
        if (date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth) {
          successCount++
          totalCount += dayRecords.length
        }
      }
    })
    
    this.setData({
      stats: {
        successCount,
        totalCount,
        totalAllTimeCount
      }
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载事件记录
  loadEventRecords() {
    try {
      const records = wx.getStorageSync(app.globalData.storageKey) || {}
      this.setData({ eventRecords: records })
      this.generateCalendar(this.data.currentYear, this.data.currentMonth)
    } catch (error) {
      console.error('加载记录失败:', error)
    }
  },

  // 点击日期
  onDateTap(e) {
    const { date } = e.currentTarget.dataset
    this.setData({ selectedDate: date })
    
    // 跳转到记录页面
    wx.navigateTo({
      url: `/pages/record/record?date=${date}`
    })
  },

  // 上一个月
  onPrevMonth() {
    console.log('点击上一个月')
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear--
    }
    
    this.setData({ currentYear, currentMonth })
    this.generateCalendar(currentYear, currentMonth)
  },

  // 下一个月
  onNextMonth() {
    console.log('点击下一个月')
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
    
    this.setData({ currentYear, currentMonth })
    this.generateCalendar(currentYear, currentMonth)
  },

  // 回到今天
  onToday() {
    console.log('点击回到今天')
    this.initCalendar()
  }
})
