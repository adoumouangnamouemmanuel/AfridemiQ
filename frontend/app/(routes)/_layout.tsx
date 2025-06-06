import { Stack } from "expo-router"

export default function RoutesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quiz/[id]" />
      <Stack.Screen name="subject/[id]" />
      <Stack.Screen name="topic/[id]" />
      <Stack.Screen name="results" />
      <Stack.Screen name="premium" />
    </Stack>
  )
}
