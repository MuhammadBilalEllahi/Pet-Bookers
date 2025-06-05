import React from 'react';
import {Dimensions, ScrollView, View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';

const {width: windowWidth} = Dimensions.get('screen');

const ads = [
  {
    id: 1,
    user: 'Atif Maqsood',
    title: 'Big Furious Lion',
    price: 'Rs 345,000',
    created: '24 Sep 2024',
    views: 26,
    messages: 3,
    badge: 'Free Ad',
    featured: false,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    user: 'Atif Maqsood',
    title: 'Big Furious Lion',
    price: 'Rs 345,000',
    created: '24 Sep 2024',
    views: 1325,
    messages: 62,
    badge: 'Featured',
    featured: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

export const MyPostedAdsScreen = ({navigation}) => {
  const { isDark, theme } = useTheme();

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 32}}>
        <Text style={[styles.header, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>My Ads</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, styles.tabActive, { backgroundColor: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
            <Text style={[styles.tabTextActive, { color: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200'] }]}>
            <Text style={[styles.tabText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Active Ads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200'] }]}>
            <Text style={[styles.tabText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Closed Ads</Text>
          </TouchableOpacity>
        </View>
        {ads.map((ad, idx) => (
          <View key={ad.id} style={[styles.card, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}>
            <View style={styles.cardTopRow}>
              <Image source={{uri: ad.avatar}} style={[styles.avatar, { backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-300'] }]} />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={[styles.userName, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>{ad.user}</Text>
                <Text style={[styles.adTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>{ad.title}</Text>
                <Text style={[styles.price, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.price}</Text>
              </View>
              <TouchableOpacity style={{padding: 4}}>
                <Icon name="more-vertical" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{width: 22, height: 22}} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.created, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>Created on {ad.created}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="eye" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={styles.statIcon} />
                <Text style={[styles.statText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.views} Views</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="message-circle" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={styles.statIcon} />
                <Text style={[styles.statText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.messages} Messages</Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <View style={[
                  styles.badge, 
                  ad.featured ? styles.badgeFeatured : styles.badgeFree,
                  { backgroundColor: ad.featured ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']) }
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    { color: ad.featured ? theme['color-shadcn-primary-foreground'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']) }
                  ]}>{ad.badge}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.featuredBtn, { backgroundColor: theme['color-shadcn-primary'] }]}>
              <Text style={[styles.featuredBtnText, { color: theme['color-shadcn-primary-foreground'] }]}>Try Featured Ads</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#222',
  },
  tabText: {
    fontWeight: 'bold',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  adTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  created: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  badgeFree: {
    backgroundColor: '#eee',
  },
  badgeFeatured: {
    backgroundColor: '#FFD600',
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  badgeTextFree: {
    color: '#888',
  },
  badgeTextFeatured: {
    color: '#222',
  },
  featuredBtn: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
