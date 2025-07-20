import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Input,
} from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedIcon } from '../Icon';

export const CustomDateTimePicker = ({
  value,
  onChange,
  label = 'Select Date & Time',
  placeholder = 'Choose date and time',
  mode = 'datetime', // 'date', 'time', 'datetime'
  minimumDate,
  maximumDate,
  style,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());
  const [tempTime, setTempTime] = useState(value ? new Date(value) : new Date());

  const handleDateChange = (year, month, day) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    newDate.setMonth(month - 1); // Month is 0-indexed
    newDate.setDate(day);
    setTempDate(newDate);
  };

  const handleTimeChange = (hour, minute) => {
    const newTime = new Date(tempTime);
    newTime.setHours(hour);
    newTime.setMinutes(minute);
    setTempTime(newTime);
  };

  const handleConfirm = () => {
    setShowPicker(false);
    let finalDate;
    
    if (mode === 'date') {
      finalDate = new Date(tempDate);
    } else if (mode === 'time') {
      finalDate = new Date(tempTime);
    } else {
      // datetime mode - combine date and time
      finalDate = new Date(tempDate);
      finalDate.setHours(tempTime.getHours());
      finalDate.setMinutes(tempTime.getMinutes());
    }
    
    onChange(finalDate.toISOString());
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempDate(value ? new Date(value) : new Date());
    setTempTime(value ? new Date(value) : new Date());
  };

  const formatDisplayValue = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (mode === 'date') {
      return date.toLocaleDateString();
    } else if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleString();
    }
  };

  const showPickerModal = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  // Generate calendar data
  const generateCalendarDays = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === tempDate.getMonth() && date.getFullYear() === tempDate.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === tempDate.getDate() && 
           date.getMonth() === tempDate.getMonth() && 
           date.getFullYear() === tempDate.getFullYear();
  };

  const isDisabled = (date) => {
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { 
        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
        marginBottom: 8 
      }]}>
        {label}
      </Text>
      
      <TouchableOpacity
        onPress={showPickerModal}
        disabled={disabled}
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? theme['color-shadcn-input'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            opacity: disabled ? 0.6 : 1,
          }
        ]}
      >
        <Text style={[styles.inputText, { 
          color: value 
            ? (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
            : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
        }]}>
          {value ? formatDisplayValue(value) : placeholder}
        </Text>
        <ThemedIcon 
          name="calendar-outline" 
          size={20} 
          style={{ 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] 
          }} 
        />
      </TouchableOpacity>

      {/* Custom Date/Time Picker Modal */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>
                Select {mode === 'date' ? 'Date' : mode === 'time' ? 'Time' : 'Date & Time'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <ThemedIcon name="close-outline" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Date Picker */}
              {(mode === 'date' || mode === 'datetime') && (
                <View style={styles.dateSection}>
                  <Text style={[styles.sectionTitle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>Date</Text>
                  
                  {/* Month/Year Navigation */}
                  <View style={styles.navigationRow}>
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setTempDate(newDate);
                      }}
                      style={styles.navButton}
                    >
                      <ThemedIcon name="chevron-left-outline" size={20} />
                    </TouchableOpacity>
                    
                    <Text style={[styles.monthYear, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>
                      {monthNames[tempDate.getMonth()]} {tempDate.getFullYear()}
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setTempDate(newDate);
                      }}
                      style={styles.navButton}
                    >
                      <ThemedIcon name="chevron-right-outline" size={20} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Calendar Grid */}
                  <View style={styles.calendarGrid}>
                    {/* Day Headers */}
                    {dayNames.map((day) => (
                      <Text key={day} style={[styles.dayHeader, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>
                        {day}
                      </Text>
                    ))}
                    
                    {/* Calendar Days */}
                    {generateCalendarDays().map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          if (!isDisabled(date)) {
                            handleDateChange(date.getFullYear(), date.getMonth() + 1, date.getDate());
                          }
                        }}
                        disabled={isDisabled(date)}
                        style={[
                          styles.dayButton,
                          {
                            backgroundColor: isSelected(date) 
                              ? theme['color-shadcn-primary'] 
                              : 'transparent',
                            opacity: isDisabled(date) ? 0.3 : 1,
                          }
                        ]}
                      >
                        <Text style={[styles.dayText, { 
                          color: isSelected(date)
                            ? 'white'
                            : isCurrentMonth(date)
                              ? (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                              : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
                        }]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Time Picker */}
              {(mode === 'time' || mode === 'datetime') && (
                <View style={styles.timeSection}>
                  <Text style={[styles.sectionTitle, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>Time</Text>
                  
                  <View style={styles.timeRow}>
                    {/* Hour Picker */}
                    <View style={styles.timePicker}>
                      <Text style={[styles.timeLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>Hour</Text>
                      <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 24 }, (_, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => handleTimeChange(i, tempTime.getMinutes())}
                            style={[
                              styles.timeOption,
                              {
                                backgroundColor: tempTime.getHours() === i 
                                  ? theme['color-shadcn-primary'] 
                                  : 'transparent'
                              }
                            ]}
                          >
                            <Text style={[styles.timeOptionText, { 
                              color: tempTime.getHours() === i 
                                ? 'white' 
                                : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                            }]}>
                              {i.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <Text style={[styles.timeSeparator, { 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }]}>:</Text>
                    
                    {/* Minute Picker */}
                    <View style={styles.timePicker}>
                      <Text style={[styles.timeLabel, { 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                      }]}>Minute</Text>
                      <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 60 }, (_, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => handleTimeChange(tempTime.getHours(), i)}
                            style={[
                              styles.timeOption,
                              {
                                backgroundColor: tempTime.getMinutes() === i 
                                  ? theme['color-shadcn-primary'] 
                                  : 'transparent'
                              }
                            ]}
                          >
                            <Text style={[styles.timeOptionText, { 
                              color: tempTime.getMinutes() === i 
                                ? 'white' 
                                : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
                            }]}>
                              {i.toString().padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Button
                appearance="outline"
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                Confirm
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    width: '100%',
    maxHeight: '80%',
  },
  dateSection: {
    marginBottom: 20,
  },
  timeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeScroll: {
    height: 120,
    width: 80,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default CustomDateTimePicker; 