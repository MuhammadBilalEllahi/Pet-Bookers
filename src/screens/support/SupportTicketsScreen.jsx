import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, RefreshControl, Alert, View, FlatList } from 'react-native';
import { 
  Layout, 
  Text, 
  List, 
  ListItem, 
  Card, 
  Button,
  Icon,
  Spinner,
  Divider
} from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {  smartBuyerClient } from '../../utils/authAxiosClient';
import { AppScreens } from '../../navigators/AppNavigator';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const SupportTicketsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const response = await smartBuyerClient.get(`customer/support-ticket/get`);
      setTickets(response.data || []);
    } catch (error) {
      console.error('Error fetching support tickets:',  error?.response?.data?.message || error?.message || error);
      Alert.alert(
        t('common.error'),
        error?.response?.data?.message || t('supportTickets.alerts.loadError')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [fetchTickets]);

  const navigateToCreateTicket = () => {
    navigation.navigate(AppScreens.CREATE_SUPPORT_TICKET);  
  };

     const navigateToTicketDetail = (ticket) => {
     navigation.navigate(AppScreens.SUPPORT_TICKET_DETAIL, { 
       ticketId: ticket.id,
       ticket: ticket
     });
   };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF6D1A';
      case 'open':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return '#757575';
      default:
        return theme['color-basic-600'];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return theme['color-basic-600'];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTicketItem = ({ item }) => (
    <Card style={[styles.ticketCard, {
      backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
      borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300'],
      shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
    }]}
    onPress={() => navigateToTicketDetail(item)}>
      <View style={styles.cardContent}>
        <View style={styles.ticketHeader}>
          <Text style={[styles.ticketSubject, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            #{item.id} - {item.subject}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, {
              backgroundColor: getStatusColor(item.status)
            }]} />
            <Text style={[styles.statusText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {t(`supportTickets.status.${item.status?.toLowerCase()}`) || item.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.ticketDescription, {
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-700']
        }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.ticketMeta}>
          <View style={styles.metaItem}>
            <Icon name="calendar" style={styles.metaIcon} fill={theme['color-basic-600']} />
            <Text style={[styles.metaText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="flag" style={styles.metaIcon} fill={getPriorityColor(item.priority)} />
            <Text style={[styles.metaText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {t(`supportTickets.priority.${item.priority?.toLowerCase()}`) || item.priority}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="pricetags" style={styles.metaIcon} fill={theme['color-basic-600']} />
            <Text style={[styles.metaText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {t(`supportTickets.types.${item.type?.toLowerCase()}`) || item.type}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

    const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name="flag" 
        style={styles.emptyIcon} 
        fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400']} 
      />
      <Text style={[styles.emptyTitle, {
        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
      }]}>
        {t('supportTickets.noTickets')}
      </Text>
      <Text style={[styles.emptyMessage, {
        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
      }]}>
        {t('supportTickets.noTicketsMessage')}
      </Text>
      <Button
        style={styles.createButton}
        onPress={navigateToCreateTicket}
        accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
      >
        {t('supportTickets.createTicket')}
      </Button>
    </View>
  );

  const ShimmerCard = () => {
    const shimmerColors = isDark 
      ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
      : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']];

    return (
      <Card style={[styles.ticketCard, { 
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
      }]}>
        <View style={styles.cardContent}>
          <ShimmerPlaceholder
            style={{ height: 20, width: '70%', marginBottom: 12, borderRadius: 8 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={{ height: 40, width: '100%', marginBottom: 12, borderRadius: 6 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <View style={styles.shimmerMeta}>
            <ShimmerPlaceholder
              style={{ height: 14, width: 80, borderRadius: 6 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={{ height: 14, width: 60, borderRadius: 6 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={{ height: 14, width: 90, borderRadius: 6 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { 
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
      }]}>
        <View style={[styles.header, {
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
        }]}>
          <Text style={[styles.headerTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {t('supportTickets.title')}
          </Text>
          <Text style={[styles.headerSubtitle, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            {t('supportTickets.subtitle')}
          </Text>
        </View>
        <View style={styles.shimmerContainer}>
          {[0,1,2].map((_, index) => (
            <ShimmerCard key={index} />
          ))}
        </View>
      </View>
    );
  }

    return (
    <Layout style={[styles.container, {
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <View style={[styles.header, {
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
      }]}>
        <Text style={[styles.headerTitle, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          {t('supportTickets.title')}
        </Text>
        <Text style={[styles.headerSubtitle, {
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
        }]}>
          {t('supportTickets.subtitle')}
        </Text>
        <Button
          style={styles.headerButton}
          size="small"
          onPress={navigateToCreateTicket}
          accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
        >
          {t('supportTickets.createTicket')}
        </Button>
      </View>

      <FlatList
        data={tickets}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderTicketItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme['color-primary-500']]}
            tintColor={theme['color-primary-500']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        style={styles.list}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shimmerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  headerButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ticketCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 15,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSubject: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  ticketMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  shimmerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  createButton: {
    paddingHorizontal: 24,
    borderRadius: 12,
  },
});

export { SupportTicketsScreen };
