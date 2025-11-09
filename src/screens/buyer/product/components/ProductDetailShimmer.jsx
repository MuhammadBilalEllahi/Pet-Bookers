import { Layout } from "@ui-kitten/components";
import { ScrollView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { useTheme } from "../../../../theme/ThemeContext";

const ProductDetailShimmer = () => {
  const { theme, isDark } = useTheme();

  const shimmerColors = isDark 
    ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
    : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']];

  return (
    <Layout level="3" style={{ flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
        }}
        showsVerticalScrollIndicator={false}>

        {/* Image Slider Placeholder */}
        <ShimmerPlaceholder
          style={{ width: '100%', height: 250, borderRadius: 8, marginBottom: 16 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          shimmerStyle={{ borderRadius: 8 }}
        />

        {/* Title and Icons Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <ShimmerPlaceholder
            style={{ width: '70%', height: 22, borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ShimmerPlaceholder
              style={{ width: 24, height: 24, borderRadius: 12 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={{ width: 24, height: 24, borderRadius: 12 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
          </View>
        </View>

        {/* Price */}
        <ShimmerPlaceholder
          style={{ width: 100, height: 20, borderRadius: 4, marginBottom: 8 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />

        {/* Discounted price */}
        <ShimmerPlaceholder
          style={{ width: 120, height: 16, borderRadius: 4, marginBottom: 16 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />

        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          {[...Array(3)].map((_, i) => (
            <ShimmerPlaceholder
              key={i}
              style={{ flex: 1, height: 45, borderRadius: 6, marginRight: i < 2 ? 8 : 0 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
          ))}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
          <ShimmerPlaceholder
            style={{ width: 80, height: 18, borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={{ width: 80, height: 18, borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>

        {/* Description Block */}
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <ShimmerPlaceholder
              style={{ width: '48%', height: 14, borderRadius: 4 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={{ width: '48%', height: 14, borderRadius: 4 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
          </View>
        ))}

      </ScrollView>
    </Layout>
  );
};

export default ProductDetailShimmer;