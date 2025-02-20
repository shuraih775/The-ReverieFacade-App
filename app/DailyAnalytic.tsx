import { View, Text, ScrollView } from 'react-native'; 
import { LineChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import { useState } from 'react';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: 'black',
  backgroundGradientFrom: 'black',
  backgroundGradientTo: 'black',
  decimalPlaces: 0,
  color: (opacity = 1) => `#ccc`,
  labelColor: (opacity = 1) => `#ccc`,
  style: { borderRadius: 16 },
  propsForDots: { r: '6', strokeWidth: '2', stroke: 'yellow' },
};

export default function DailyAnalytics({ dailydata }) {
  const [selectedCategory, setSelectedCategory] = useState("theme");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeklyDurations = Array(7).fill(0);

  for (const [day, entries] of Object.entries(dailydata)) {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex !== -1) {
      const totalDurationForDay = entries.reduce((sum, entry) => sum + Number(entry.duration), 0); 
      weeklyDurations[dayIndex] = totalDurationForDay;
    }
  }

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: weeklyDurations,
        color: (opacity = 1) => `yellow`,
        strokeWidth: 2,
      },
    ],
  };

  // Function to get the top 3 occurrences for the selected category
  const countOccurrences = (category) => {
    const counts = {};
    Object.values(dailydata).forEach(entries => {
      entries.forEach(entry => {
        const key = entry[category];
        if (key) {
          counts[key] = (counts[key] || 0) + Number(entry.duration); 
        }
      });
    });

    
    const Categories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) ; 
  
  const top3Categories = Categories.slice(0,3)

  const otherCategories = Categories.slice(3)

  const othersDuration = otherCategories.reduce((sum, [, duration]) => sum + duration, 0);

  const colors = ["#FFFF00", "#008080", "#FA8072","#DC143C"]; 
  const pieChartData = [
    ...top3Categories.map(([category, duration], index) => ({
      name: category,
      population: duration,
      color: colors[index % colors.length],
      legendFontColor: "#ccc",
      legendFontSize: 14,
    })),
    {
      name: "Others",
      population: othersDuration,
      color: colors[3],
      legendFontColor: "#ccc",
      legendFontSize: 14,
    },
  ];
  return pieChartData
  };

  return (
    <ScrollView 
      className='bg-[#1F1F1F] pb-48'
      contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}
    >
      <Text className="text-3xl mb-5 mt-4  text-gray-100 font-bold">Daydreams (in mins)</Text>
      {/* Line Chart */}
      <View className='bg-black mb-8 items-center rounded-2xl p-5 w-[90%]'>
        
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="min"
          chartConfig={chartConfig}
          bezier
          fromZero
        />
      </View>
      <Text className='text-2xl text-gray-100 mt-24'>More Detailed Analytics (Today):</Text>
      {/* Pie Chart Selector */}
      <View className="bg-black p-4 rounded-lg mb-5 mt-3 w-[90%]">
        <Text className="text-lg text-gray-200 text-center font-bold mb-2">Most Frequent</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCategory(value)}
          items={[
            { label: "Theme", value: "theme" },
            { label: "Work During Dream", value: "workDuringDream" },
            { label: "Mood", value: "mood" },
            { label: "Time", value: "time" },
          ]}
          value={selectedCategory}
          style={{
            inputIOS: { color: "#ccc", padding: 10, backgroundColor: "#1f1f1f", borderRadius: 5, textAlign: "center" },
            inputAndroid: { color: "#ccc", padding: 10, backgroundColor: "#1f1f1f", borderRadius: 5, textAlign: "center" },
          }}
        />
      </View>

      {/* Pie Chart with Top 3 Categories */}
      <View className='bg-zinc-900 shadow-lg shadow-amber-200 mb-10 items-center rounded-lg p-5 w-[90%]' style={{ minHeight: 200 }}>
        <Text className="text-3xl text-gray-200 mb-4 font-bold">Top {selectedCategory}</Text>
        {countOccurrences(selectedCategory).length > 1?(<PieChart
          data={countOccurrences(selectedCategory)}
          width={screenWidth - 50}
          height={220} 
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute={false} 
        />):(
          <Text className='text-gray-400'>No data Available</Text>
        )}
        
      </View>

    </ScrollView>
  );
}
