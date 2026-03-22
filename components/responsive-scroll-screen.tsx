import { PropsWithChildren, RefObject } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ResponsiveScrollScreenProps = PropsWithChildren<{
  backgroundColor?: string;
  bottomInsetBehavior?: 'safe-area' | 'tab-bar';
  contentStyle?: StyleProp<ViewStyle>;
  contentWrapStyle?: StyleProp<ViewStyle>;
  scrollRef?: RefObject<ScrollView | null>;
}>;

export function ResponsiveScrollScreen({
  children,
  backgroundColor = '#FFF8F2',
  bottomInsetBehavior = 'safe-area',
  contentStyle,
  contentWrapStyle,
  scrollRef,
}: ResponsiveScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = bottomInsetBehavior === 'tab-bar' ? 0 : Math.max(insets.bottom, 16) + 20;

  return (
    <SafeAreaView
      edges={bottomInsetBehavior === 'tab-bar' ? ['left', 'right'] : ['left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 10) + 10,
            paddingBottom,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrap, contentWrapStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
});
