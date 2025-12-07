const app = getApp()

Page({
  data: {
    selectedDate: '',
    displayDate: '',
    recordCount: 0,
    recordTimes: []
  },

  onLoad(options) {
    const { date } = options
    if (date) {
      this.setData({
        selectedDate: date,
        displayDate: this.formatDisplayDate(date)
      })
      this.loadRecord(date)
    }
  },

  // 格式化显示日期
  formatDisplayDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const weekDay = weekDays[date.getDay()]
    return `${year}年${month}月${day}日 ${weekDay}`
  },

  // 加载记录
  loadRecord(date) {
    try {
      const records = wx.getStorageSync(app.globalData.storageKey) || {}
      const dayRecords = records[date] || []
      
      this.setData({
        recordCount: dayRecords.length,
        recordTimes: dayRecords
      })
    } catch (error) {
      console.error('加载记录失败:', error)
    }
  },

  // 记录事件发生
  onRecordSuccess() {
    this.addRecord()
  },

  // 添加记录
  addRecord() {
    try {
      const now = new Date()
      const timeStr = this.formatTime(now)
      
      const records = wx.getStorageSync(app.globalData.storageKey) || {}
      const dayRecords = records[this.data.selectedDate] || []
      
      // 添加新记录
      dayRecords.push({
        time: timeStr,
        timestamp: now.getTime()
      })
      
      // 保存到存储
      records[this.data.selectedDate] = dayRecords
      wx.setStorageSync(app.globalData.storageKey, records)
      
      // 更新页面数据
      this.setData({
        recordCount: dayRecords.length,
        recordTimes: dayRecords
      })

      wx.showToast({
        title: '记录成功',
        icon: 'success',
        duration: 1500
      })

    } catch (error) {
      console.error('保存记录失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 格式化时间
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  },

  // 删除单条记录
  onDeleteRecord(e) {
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteSingleRecord(index)
        }
      }
    })
  },

  // 删除单条记录执行
  deleteSingleRecord(index) {
    try {
      const records = wx.getStorageSync(app.globalData.storageKey) || {}
      const dayRecords = records[this.data.selectedDate] || []
      
      // 删除指定索引的记录
      dayRecords.splice(index, 1)
      
      // 如果没有记录了，删除整个日期的记录
      if (dayRecords.length === 0) {
        delete records[this.data.selectedDate]
      } else {
        records[this.data.selectedDate] = dayRecords
      }
      
      wx.setStorageSync(app.globalData.storageKey, records)
      
      // 更新页面数据
      this.setData({
        recordCount: dayRecords.length,
        recordTimes: dayRecords
      })

      wx.showToast({
        title: '记录已删除',
        icon: 'success',
        duration: 1500
      })

    } catch (error) {
      console.error('删除记录失败:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  // 清空当天所有记录
  onClearAllRecords() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当天的所有记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.clearAllRecords()
        }
      }
    })
  },

  // 清空所有记录执行
  clearAllRecords() {
    try {
      const records = wx.getStorageSync(app.globalData.storageKey) || {}
      delete records[this.data.selectedDate]
      
      wx.setStorageSync(app.globalData.storageKey, records)
      
      this.setData({
        recordCount: 0,
        recordTimes: []
      })

      wx.showToast({
        title: '已清空所有记录',
        icon: 'success',
        duration: 1500
      })

    } catch (error) {
      console.error('清空记录失败:', error)
      wx.showToast({
        title: '清空失败',
        icon: 'error'
      })
    }
  }
})
