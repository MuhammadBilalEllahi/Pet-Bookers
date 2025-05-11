import React from 'react';
import {Dimensions, ScrollView, View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';

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
  return (
    <Layout level="3" style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 32}}>
        <Text style={styles.header}>My Ads</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>All</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Active Ads</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Closed Ads</Text></TouchableOpacity>
        </View>
        {ads.map((ad, idx) => (
          <View key={ad.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Image source={{uri: ad.avatar}} style={styles.avatar} />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.userName}>{ad.user}</Text>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.price}>{ad.price}</Text>
              </View>
              <TouchableOpacity style={{padding: 4}}>
                <Icon name="more-vertical" fill="#888" style={{width: 22, height: 22}} />
              </TouchableOpacity>
            </View>
            <Text style={styles.created}>Created on {ad.created}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="eye" fill="#888" style={styles.statIcon} />
                <Text style={styles.statText}>{ad.views} Views</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="message-circle" fill="#888" style={styles.statIcon} />
                <Text style={styles.statText}>{ad.messages} Messages</Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <View style={[styles.badge, ad.featured ? styles.badgeFeatured : styles.badgeFree]}>
                  <Text style={[styles.badgeText, ad.featured ? styles.badgeTextFeatured : styles.badgeTextFree]}>{ad.badge}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.featuredBtn}>
              <Text style={styles.featuredBtnText}>Try Featured Ads</Text>
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
    color: '#222',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#222',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
    backgroundColor: '#eee',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  adTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginTop: 2,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  created: {
    color: '#888',
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
    color: '#888',
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
    backgroundColor: 'linear-gradient(90deg, #FF512F 0%, #F09819 100%)',
    background: 'linear-gradient(90deg, #FF512F 0%, #F09819 100%)',
    // fallback for React Native: use a solid color
    backgroundColor: '#FF512F',
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
