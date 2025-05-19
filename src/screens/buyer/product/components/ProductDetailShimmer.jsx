import { Layout } from "@ui-kitten/components";
import { ScrollView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const ProductDetailShimmer = () => {
  return (
    <Layout level="3" style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 10,
          paddingHorizontal: 12,
        }}
        showsVerticalScrollIndicator={false}>

        {/* Image Slider Placeholder */}
        <ShimmerPlaceholder
          style={{ width: '100%', height: 250, borderRadius: 8, marginBottom: 16 }}
          LinearGradient={LinearGradient}
          shimmerStyle={{ borderRadius: 8 }}
        />

        {/* Title and Icons Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <ShimmerPlaceholder
            style={{ width: '70%', height: 22, borderRadius: 4 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={{ width: 24, height: 24, borderRadius: 12 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={{ width: 24, height: 24, borderRadius: 12 }}
            LinearGradient={LinearGradient}
          />
        </View>

        {/* Price */}
        <ShimmerPlaceholder
          style={{ width: 100, height: 20, borderRadius: 4, marginBottom: 8 }}
          LinearGradient={LinearGradient}
        />

        {/* Discounted price */}
        <ShimmerPlaceholder
          style={{ width: 120, height: 16, borderRadius: 4, marginBottom: 16 }}
          LinearGradient={LinearGradient}
        />

        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          {[...Array(3)].map((_, i) => (
            <ShimmerPlaceholder
              key={i}
              style={{ flex: 1, height: 45, borderRadius: 6, marginRight: i < 2 ? 8 : 0 }}
              LinearGradient={LinearGradient}
            />
          ))}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
          <ShimmerPlaceholder
            style={{ width: 80, height: 18, borderRadius: 4 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={{ width: 80, height: 18, borderRadius: 4 }}
            LinearGradient={LinearGradient}
          />
        </View>

        {/* Description Block */}
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <ShimmerPlaceholder
              style={{ width: '48%', height: 14, borderRadius: 4 }}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={{ width: '48%', height: 14, borderRadius: 4 }}
              LinearGradient={LinearGradient}
            />
          </View>
        ))}

        {/* Shop Display */}

        <View style={{ flexDirection: 'row', paddingLeft: 50, marginTop: 20, alignItems: 'center' }}>
          <ShimmerPlaceholder

            style={{ width: 60, height: 60, borderRadius: 100, marginBottom: 10 }}
            LinearGradient={LinearGradient}
          />

          <View style={{ flexDirection: 'column', marginLeft: 20 }}>
            <ShimmerPlaceholder

              style={{ width: 200, height: 16, borderRadius: 4, marginBottom: 10 }}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder

              style={{ width: 150, height: 16, borderRadius: 4, marginBottom: 10 }}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
          <ShimmerPlaceholder

            style={{ width: 160, height: 120, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
          /><ShimmerPlaceholder

            style={{ width: 160, height: 120, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 80 }}>
          <ShimmerPlaceholder

            style={{ width: '90%', height: 30, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
          />
        </View>





        {/* {[...Array(4)].map((_, i) => (
          <ShimmerPlaceholder
            key={i}
            style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 10 }}
            LinearGradient={LinearGradient}
          />
        ))} */}


      </ScrollView>
    </Layout>
  );
};
export default ProductDetailShimmer;