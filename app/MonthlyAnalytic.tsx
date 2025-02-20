import { useState } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { View, Text, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

export default function MonthlyAnalytics({ data }) {
  const maxHeight = 150;
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedCategory, setSelectedCategory] = useState("theme"); 

  const monthList = [
    { label: "Jan", value: "1" }, { label: "Feb", value: "2" }, { label: "Mar", value: "3" },
    { label: "Apr", value: "4" }, { label: "May", value: "5" }, { label: "Jun", value: "6" },
    { label: "Jul", value: "7" }, { label: "Aug", value: "8" }, { label: "Sep", value: "9" },
    { label: "Oct", value: "10" }, { label: "Nov", value: "11" }, { label: "Dec", value: "12" }
  ];

  let monthlyData = Array(12).fill(0);
  for (let month = 1; month <= 12; month++) {
    const monthString = month.toString();
    if (data[monthString]) {
      data[monthString].forEach(entry => {
        monthlyData[monthString - 1] += Number(entry.duration); 
      });
    }
  }

  const monthlyValues = Object.values(monthlyData);
  const maxData = Math.max(...monthlyValues);
  let heights = Array(12).fill(0);

  monthlyValues.forEach((value, index) => {
    heights[index] = value !== 0 ? (value / maxData) * maxHeight : 0;
  });


  const categoryCounts = {};
  if (data[selectedMonth]) {
    data[selectedMonth].forEach(item => {
      const category = item[selectedCategory] || "Other";
      categoryCounts[category] = (categoryCounts[category] || 0) + Number(item.duration);
    });
  }

  
  const Categories = Object.entries(categoryCounts)
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
    <ScrollView className='m-0 bg-[#1F1F1F] pt-5 pb-48' contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
      
      {/* Monthly Bar Chart */}
      <View className='bg-black p-5 rounded-2xl' style={{ width: screenWidth - 30 }}>
        <Text className="text-xl text-gray-100 font-bold mb-5">Daydreams (in mins)</Text>
        <View className='bg-[#1f1f1f] flex flex-row border-b border-b-black w-full justify-center text-center rounded-t-[20px] pt-7 pl-2 relative' style={{ height: maxHeight + 30 }}>
          {[5, 4, 3, 2, 1].map(level => (
            <Text key={level} className="absolute left-0 text-[gray]" style={{ bottom: maxHeight / 5 * level, fontSize: 10, color:'white',left:5 }}>
              {Math.round(maxData / 5 * level)} {" -".repeat(Math.floor(screenWidth / 7.5))}
            </Text>
          ))}
          {heights.map((height, index) => (
            <View key={index} style={{ height, backgroundColor: "yellow", marginLeft: 9, marginRight: 6, width: 6, marginTop: "auto", borderTopLeftRadius: 5, borderTopRightRadius: 5 }}></View>
          ))}
        </View>

        {/* Month Labels */}
        <View className='bg-[#1f1f1f] flex-row justify-center w-full rounded-b-[20px] p-2 '>
          {monthList.map((month, index) => (
            <Text key={index} style={{ marginLeft: 4.0, marginRight: 0.5, width: 16, fontSize: 8.3, textAlign: 'center', marginTop: 1,color:'white' }}>
              {month.label}
            </Text>
          ))}
        </View>
      </View>

      
      <Text className='text-2xl text-gray-100 mt-24'>More Detailed Analytics:</Text>
      {/* Pie Chart Selector */}
      <View className="bg-black p-4 rounded-lg mt-3 w-[90%]">
        <Text className="text-lg text-center text-gray-200 font-bold mb-2">Most Frequent</Text>
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
        
      {/* Month Selector */}
      <View className="bg-black mt-3 rounded-lg mb-3 w-[80%]">
      <Text className="text-gray-200 font-bold text-center text-lg mt-5 ">Select Month:</Text>
      <RNPickerSelect
        value={selectedMonth}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        items={monthList}
        style={{
          inputIOS: { color: "#ccc", padding: 10,margin:10 ,backgroundColor: "#1f1f1f", borderRadius: 5, textAlign: "center" },
          inputAndroid: { color: "#ccc", padding: 10,margin:10, backgroundColor: "#1f1f1f", borderRadius: 5, textAlign: "center" },
        }}
        
      />
      </View>

      {/* Pie Chart for Top 3 Categories */}
      <View className='bg-zinc-900 shadow-lg shadow-amber-200 mb-10 items-center rounded-lg p-5 w-[90%]' style={{ minHeight: 300 }}>
        <Text className="text-3xl text-gray-200 mb-4 font-bold">Top 3 {selectedCategory}</Text>
        {pieChartData.length >1 ? (<PieChart
          data={pieChartData}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={{ marginVertical: 8, borderRadius: 16 }}
        />):(
          <Text className='text-gray-400'>No data Available</Text>
        )}
      </View>

    </ScrollView>
  );
}
