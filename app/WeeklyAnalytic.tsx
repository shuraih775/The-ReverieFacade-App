import { Text, ScrollView, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import { Dimensions } from 'react-native';
import { useState } from 'react';

const screenWidth = Dimensions.get("window").width;

export default function WeeklyAnalytics({ data1 }) {
  const [selectedCategory, setSelectedCategory] = useState("theme");

  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  let weekData = Array(4).fill(0);

  for (let i = 0; i < weekLabels.length; i++) {
    let week = weekLabels[i];
    if (data1[week]) {
      weekData[i] = Number(data1[week].totalDuration);
    }
  }

  const themeCounts = {};
  Object.keys(data1).forEach(week => {
    data1[week].entries.forEach(entry => {
      const key = entry[selectedCategory] || "Other";
      themeCounts[key] = (themeCounts[key] || 0) + Number(entry.duration);
    });
  });

  const Categories = Object.entries(themeCounts)
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

  return (
    <ScrollView className='m-0  bg-[#1F1F1F] pt-5 pb-48' contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
      
      {/* Bar Chart */}
      <Text className="text-3xl mb-4 font-bold text-white">Daydreams (in mins)</Text>
      <BarChart
        data={{
          labels: weekLabels,
          datasets: [{ data: weekData, color: () => '#007bff' }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="min"
        chartConfig={{
          backgroundColor: 'black',
          backgroundGradientFrom: 'black',
          backgroundGradientTo: 'black',
          decimalPlaces: 0,
          color: (opacity = 1) => `yellow`,
          labelColor: (opacity = 1) => `white`,
          style: { borderRadius: 16 },
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#ccc' },
        }}
        style={{ marginVertical: 10, borderRadius: 16 }}
      />
  <Text className='text-2xl text-gray-100 mt-24'>More Detailed Analytics (This week):</Text>

      {/* Pie Chart Selector */}
      <View className="bg-black p-4 rounded-lg mb-5 mt-3  w-[90%]">
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
      <View className='bg-zinc-900 shadow-lg shadow-amber-200 mb-10 items-center rounded-lg p-5 w-[90%]' style={{ minHeight: 300 }}>
        <Text className="text-3xl text-gray-200 mb-4 font-bold">Top {selectedCategory}</Text>
        {
          pieChartData.length >1?(<PieChart
            data={pieChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />):
          (<Text className='text-gray-400'>No data Available</Text>)
        }
      </View>

    </ScrollView>
  );
}
