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

        {/* Shop Display */}
        <View style={{ 
          flexDirection: 'row', 
          paddingLeft: 50, 
          marginTop: 20, 
          alignItems: 'center',
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
        }}>
          <ShimmerPlaceholder
            style={{ width: 60, height: 60, borderRadius: 100, marginBottom: 10 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />

          <View style={{ flexDirection: 'column', marginLeft: 20 }}>
            <ShimmerPlaceholder
              style={{ width: 200, height: 16, borderRadius: 4, marginBottom: 10 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
            <ShimmerPlaceholder
              style={{ width: 150, height: 16, borderRadius: 4, marginBottom: 10 }}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 }}>
          <ShimmerPlaceholder
            style={{ width: 160, height: 120, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={{ width: 160, height: 120, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 80 }}>
          <ShimmerPlaceholder
            style={{ width: '90%', height: 30, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>
      </ScrollView>
    </Layout>
  );
};

export default ProductDetailShimmer;