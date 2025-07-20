import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Layout,
  Text,
  Card,
} from '@ui-kitten/components';
import { CustomDateTimePicker } from './DateTimePicker';
import { useTheme } from '../../theme/ThemeContext';

export const DateTimePickerExample = () => {
  const { theme, isDark } = useTheme();
  const [dateTime, setDateTime] = useState('');
  const [dateOnly, setDateOnly] = useState('');
  const [timeOnly, setTimeOnly] = useState('');

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>DateTime Picker Examples</Text>

        <Card style={[styles.card, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <Text style={[styles.cardTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Date & Time Picker</Text>
          <CustomDateTimePicker
            label="Select Date & Time"
            value={dateTime}
            onChange={setDateTime}
            placeholder="Choose date and time"
            mode="datetime"
          />
          {dateTime && (
            <Text style={[styles.result, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Selected: {new Date(dateTime).toLocaleString()}
            </Text>
          )}
        </Card>

        <Card style={[styles.card, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <Text style={[styles.cardTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Date Only Picker</Text>
          <CustomDateTimePicker
            label="Select Date"
            value={dateOnly}
            onChange={setDateOnly}
            placeholder="Choose date only"
            mode="date"
          />
          {dateOnly && (
            <Text style={[styles.result, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Selected: {new Date(dateOnly).toLocaleDateString()}
            </Text>
          )}
        </Card>

        <Card style={[styles.card, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <Text style={[styles.cardTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Time Only Picker</Text>
          <CustomDateTimePicker
            label="Select Time"
            value={timeOnly}
            onChange={setTimeOnly}
            placeholder="Choose time only"
            mode="time"
          />
          {timeOnly && (
            <Text style={[styles.result, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Selected: {new Date(timeOnly).toLocaleTimeString()}
            </Text>
          )}
        </Card>

        <Card style={[styles.card, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <Text style={[styles.cardTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>With Date Range</Text>
          <CustomDateTimePicker
            label="Start Date"
            value={dateTime}
            onChange={setDateTime}
            placeholder="Choose start date"
            mode="date"
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          />
        </Card>

        <Card style={[styles.card, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)'
        }]}>
          <Text style={[styles.cardTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Disabled Picker</Text>
          <CustomDateTimePicker
            label="Disabled Date Picker"
            value=""
            onChange={() => {}}
            placeholder="This picker is disabled"
            disabled={true}
          />
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  result: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default DateTimePickerExample; 