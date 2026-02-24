
import stopLine from '@/assets/images/stopLine.png'
import SlowDownToGiveWay from '@/assets/images/SlowDownToGiveWay.png'
import StopToGiveWay from '@/assets/images/StopToGiveWay.png'
// 交通标识
const rode_sign = '/models1/roadSign_model/'
const traffic_sign = '/models1/traffic_sign_model/'
const obj_model = '/models1/obj_model/'
const traffic_light = '/models1/traffic_light_model/'
const vehicle = '/models1/vehicle/'
const people = '/models1/people/'
const object = '/models1/object/'
export const MODAL_TO_URL: any = {
  // signal  ----------------------------------------------------------------------------------------------交通灯 7 个 type_subtype
  车道信号灯_0: traffic_light + '车道信号灯_RedLight.glb',
  车道信号灯_2: traffic_light + '车道信号灯_GreenLight.glb',
  车道信号灯: traffic_light + '车道信号灯.glb',
  横排全方位灯_0: traffic_light + '横排全方位灯_RedLight.glb',
  横排全方位灯_1: traffic_light + '横排全方位灯_YellowLight.glb',
  横排全方位灯_2: traffic_light + '横排全方位灯_GreenLight.glb',
  横排全方位灯: traffic_light + '横排全方位灯.glb',
  横向右转灯_0: traffic_light + '横向右转灯_RedLight.glb',
  横向右转灯_1: traffic_light + '横向右转灯_YellowLight.glb',
  横向右转灯_2: traffic_light + '横向右转灯_GreenLight.glb',
  横向右转灯: traffic_light + '横向右转灯.glb',
  横向直行灯_0: traffic_light + '横向直行灯_RedLight.glb',
  横向直行灯_1: traffic_light + '横向直行灯_YellowLight.glb',
  横向直行灯_2: traffic_light + '横向直行灯_GreenLight.glb',
  横向直行灯: traffic_light + '横向直行灯.glb',
  横向左转灯_0: traffic_light + '横向左转灯_RedLight.glb',
  横向左转灯_1: traffic_light + '横向左转灯_YellowLight.glb',
  横向左转灯_2: traffic_light + '横向左转灯_GreenLight.glb',
  横向左转灯: traffic_light + '横向左转灯.glb',
  竖排全方位灯_0: traffic_light + '竖排全方位灯_RedLight.glb',
  竖排全方位灯_1: traffic_light + '竖排全方位灯_YellowLight.glb',
  竖排全方位灯_2: traffic_light + '竖排全方位灯_GreenLight.glb',
  竖排全方位灯: traffic_light + '竖排全方位灯.glb',
  竖排直行灯_0: traffic_light + '竖排直行灯_RedLight.glb',
  竖排直行灯_1: traffic_light + '竖排直行灯_YellowLight.glb',
  竖排直行灯_2: traffic_light + '竖排直行灯_GreenLight.glb',
  竖排直行灯: traffic_light + '竖排直行灯.glb',
  竖排左转灯_0: traffic_light + '竖排左转灯_RedLight.glb',
  竖排左转灯_1: traffic_light + '竖排左转灯_YellowLight.glb',
  竖排左转灯_2: traffic_light + '竖排左转灯_GreenLight.glb',
  竖排左转灯: traffic_light + '竖排左转灯.glb',
  竖排右转灯_0: traffic_light + '竖排右转灯_RedLight.glb',
  竖排右转灯_1: traffic_light + '竖排右转灯_YellowLight.glb',
  竖排右转灯_2: traffic_light + '竖排右转灯_GreenLight.glb',
  竖排右转灯: traffic_light + '竖排右转灯.glb',
  单车指示灯_0: traffic_light + '单车指示灯_RedLight.glb',
  单车指示灯_2: traffic_light + '单车指示灯_GreenLight.glb',
  单车指示灯: traffic_light + '单车指示灯.glb',
  竖排人行灯_0: traffic_light + '竖排人行灯_RedLight.glb',
  竖排人行灯_2: traffic_light + '竖排人行灯_GreenLight.glb',
  竖排人行灯: traffic_light + '竖排人行灯.glb',
  双色指示灯_0: traffic_light + '双色指示灯_RedLight.glb',
  双色指示灯_2: traffic_light + '双色指示灯_GreenLight.glb',
  双色指示灯: traffic_light + '双色指示灯.glb',
  // signal -----------------------------------------------------------------------------------------------交通标识 126 个
  Attention: traffic_sign + 'Attention.glb', // 注意危险"
  'Attention_ To_Confluence': traffic_sign + 'Attention_ To_Confluence.glb', //注意合流"
  'Attention_ To_Keep_Distance': traffic_sign + 'Attention_ To_Keep_Distance.glb', //注意保持车距"
  Attention_Disabled_Individuals: traffic_sign + 'Attention_Disabled_Individuals.glb', //注意残疾人"
  Attention_Lane_Reduction_Ahead_1: traffic_sign + 'Attention_Lane_Reduction_Ahead_1.glb', //注意车道数变少-1"
  Attention_Lane_Reduction_Ahead_2: traffic_sign + 'Attention_Lane_Reduction_Ahead_2.glb', //注意车道数变少-2"
  Attention_Signal: traffic_sign + 'Attention_Signal.glb', //注意信号灯"
  Attention_Tide_Lanes: traffic_sign + 'Attention_Tide_Lanes.glb', //注意潮汐车道"
  Automated_Toll_Lane: traffic_sign + 'Automated_Toll_Lane.glb', //ETC车道"
  Bilateral_Traffic: traffic_sign + 'Bilateral_Traffic.glb', //双向交通标志"
  Cancle_No_OverTaking: traffic_sign + 'Cancle_No_OverTaking.glb', //解除禁止超车"
  Circle_Crossing: traffic_sign + 'Circle_Crossing.glb', //环形交叉"
  Combined_Speed_Limit_Sign_1: traffic_sign + 'Combined_Speed_Limit_Sign_1.glb', //组合限速标志1"
  Construction_Mark: traffic_sign + 'Construction_Mark.glb', //施工标志"
  Continuous_DownSlopes: traffic_sign + 'Continuous_DownSlopes.glb', //连续下坡"
  Crosswalk: traffic_sign + 'Crosswalk.glb', //人行横道"
  Detour_On_The_Left: traffic_sign + 'Detour_On_The_Left.glb', //左侧绕行"
  Detour_On_The_LeftAndRight: traffic_sign + 'Detour_On_The_LeftAndRight.glb', //左右绕行"
  Detour_On_The_Right: traffic_sign + 'Detour_On_The_Right.glb', //右侧绕行"
  Ding_Flat_Crossing: traffic_sign + 'Ding_Flat_Crossing.glb', //丁字平面交叉"
  Down_Steep_Slope: traffic_sign + 'Down_Steep_Slope.glb', //下陡坡"
  ETC_Lane_InnerSide: traffic_sign + 'ETC_Lane_InnerSide.glb', //ETC车道指引-内侧"
  Flyover_Straight_And_TurnLeft: traffic_sign + 'Flyover_Straight_And_TurnLeft.glb', //立体交叉直行和左转弯行驶"
  Flyover_Straight_And_TurnRight: traffic_sign + 'Flyover_Straight_And_TurnRight.glb', //立体交叉直行和右转弯行驶"
  Give_Way: traffic_sign + 'Give_Way.glb', //会车让行"
  'Height_Limit_2.5': traffic_sign + 'Height_Limit_2.5.glb', //限高2.5米"
  'Height_Limit_3.5': traffic_sign + 'Height_Limit_3.5.glb', //限高3.5米"
  Height_Limit_5: traffic_sign + 'Height_Limit_5.glb', //限高5米"
  LeftSide_Of_The_Road_Driving: traffic_sign + 'LeftSide_Of_The_Road_Driving.glb', //靠左侧道路行驶"
  Long_Curve_Road: traffic_sign + 'Long_Curve_Road.glb', //连续弯路"
  Manual_Toll_Lane: traffic_sign + 'Manual_Toll_Lane.glb', //人工收费车道"
  Minimum_Speed_Limit_40: traffic_sign + 'Minimum_Speed_Limit_40.glb', //最低限速40"
  Minimum_Speed_Limit_50: traffic_sign + 'Minimum_Speed_Limit_50.glb', //最低限速50"
  Minimum_Speed_Limit_60: traffic_sign + 'Minimum_Speed_Limit_60.glb', //最低限速60"
  MotorVehicle_Driving: traffic_sign + 'MotorVehicle_Driving.glb', //机动车行驶"
  Mountain_DropOff_Left: traffic_sign + 'Mountain_DropOff_Left.glb', //左侧傍山险路"
  Mountain_DropOff_Right: traffic_sign + 'Mountain_DropOff_Right.glb', //右侧傍山险路"
  Narrow_Road_BothSide: traffic_sign + 'Narrow_Road_BothSide.glb', //窄路两侧变窄"
  Narrow_Road_Left: traffic_sign + 'Narrow_Road_Left.glb', //窄路左侧变窄"
  Narrow_Road_Right: traffic_sign + 'Narrow_Road_Right.glb', //窄路右侧变窄"
  No_Buses_Entry: traffic_sign + 'No_Buses_Entry.glb', //禁止大型客车驶入"
  No_Entry: traffic_sign + 'No_Entry.glb', //禁止驶入"
  No_Left_Right_Turn: traffic_sign + 'No_Left_Right_Turn.glb', //禁止左右转"
  No_Left_Turn: traffic_sign + 'No_Left_Turn.glb', //禁止左转"
  No_Long_Time_Parking: traffic_sign + 'No_Long_Time_Parking.glb', //禁止长时停车"
  No_MotorVehicle_Entry: traffic_sign + 'No_MotorVehicle_Entry.glb', //禁止机动车驶入"
  No_Motorcycle_Entry: traffic_sign + 'No_Motorcycle_Entry.glb', //禁止二轮摩托车驶入"
  No_NonMotorVehicle_Entry: traffic_sign + 'No_NonMotorVehicle_Entry.glb', //禁止非机动车进入"
  No_OverTaking: traffic_sign + 'No_OverTaking.glb', //禁止超车"
  No_Parking: traffic_sign + 'No_Parking.glb', //禁止停车"
  No_Passing: traffic_sign + 'No_Passing.glb', //禁止通行"
  No_Pedestrians: traffic_sign + 'No_Pedestrians.glb', //禁止行人"
  No_Right_Turn: traffic_sign + 'No_Right_Turn.glb', //禁止右转"
  No_Straight: traffic_sign + 'No_Straight.glb', //禁止直行"
  No_Straight_Left_Turn: traffic_sign + 'No_Straight_Left_Turn.glb', //禁止直行左转"
  No_Straight_Right_Turn: traffic_sign + 'No_Straight_Right_Turn.glb', //禁止直行右转"
  No_Tractor_Entry: traffic_sign + 'No_Tractor_Entry.glb', //禁止拖拉机驶入"
  No_U_Turn: traffic_sign + 'No_U_Turn.glb', //禁止掉头"
  Non_MotorVehicle_Driving: traffic_sign + 'Non_MotorVehicle_Driving.glb', //非机动车行驶"
  Parking_And_Be_Checked: traffic_sign + 'Parking_And_Be_Checked.glb', //停车检查"
  Parkingspace: traffic_sign + 'Parkingspace.glb', //停车场"
  Passable_Lane: traffic_sign + 'Passable_Lane.glb', //绿色通道"
  Pay_Attention_To_Children: traffic_sign + 'Pay_Attention_To_Children.glb', //注意儿童"
  Pay_Attention_To_NonMotorVehicle: traffic_sign + 'Pay_Attention_To_NonMotorVehicle.glb', //注意非机动车"
  Pay_Attention_To_Pedestrians: traffic_sign + 'Pay_Attention_To_Pedestrians.glb', //注意行人"
  Ramp_Ahead: traffic_sign + 'Ramp_Ahead.glb', //匝道"
  Remove_Speed_Limit_10: traffic_sign + 'Remove_Speed_Limit_10.glb', //解除限速10"
  Remove_Speed_Limit_20: traffic_sign + 'Remove_Speed_Limit_20.glb', //解除限速20"
  Remove_Speed_Limit_30: traffic_sign + 'Remove_Speed_Limit_30.glb', //解除限速30"
  Remove_Speed_Limit_40: traffic_sign + 'Remove_Speed_Limit_40.glb', //解除限速40"
  Remove_Speed_Limit_50: traffic_sign + 'Remove_Speed_Limit_50.glb', //解除限速50"
  Remove_Speed_Limit_60: traffic_sign + 'Remove_Speed_Limit_60.glb', //解除限速60"
  Remove_Speed_Limit_70: traffic_sign + 'Remove_Speed_Limit_70.glb', //解除限速70"
  Remove_Speed_Limit_80: traffic_sign + 'Remove_Speed_Limit_80.glb', //解除限速80"
  Remove_Speed_Limit_90: traffic_sign + 'Remove_Speed_Limit_90.glb', //解除限速90"
  Remove_Speed_Limit_100: traffic_sign + 'Remove_Speed_Limit_100.glb', //解除限速100"
  Remove_Speed_Limit_120: traffic_sign + 'Remove_Speed_Limit_120.glb', //解除限速120"
  Reverse_Detour_Left: traffic_sign + 'Reverse_Detour_Left.glb', //反向弯路-左"
  Reverse_Detour_Right: traffic_sign + 'Reverse_Detour_Right.glb', //反向弯路-右"
  Regional_Speed_Limit_10: traffic_sign + 'Regional_Speed_Limit_10.glb', // 限速10区域
  RightSide_Of_The_Road_Driving: traffic_sign + 'RightSide_Of_The_Road_Driving.glb', //靠右侧道路行驶"
  RoundAbout_Driving: traffic_sign + 'RoundAbout_Driving.glb', //环岛行驶"
  Slow_Driving: traffic_sign + 'Slow_Driving.glb', //慢行"
  Speed_Limit_10: traffic_sign + 'Speed_Limit_10.glb', //限速10"
  Speed_Limit_20: traffic_sign + 'Speed_Limit_20.glb', //限速20"
  Speed_Limit_30: traffic_sign + 'Speed_Limit_30.glb', //限速30"
  Speed_Limit_40: traffic_sign + 'Speed_Limit_40.glb', //限速40"
  Speed_Limit_50: traffic_sign + 'Speed_Limit_50.glb', //限速50"
  Speed_Limit_60: traffic_sign + 'Speed_Limit_60.glb', //限速60"
  'Speed_Limit_60-90': traffic_sign + 'Speed_Limit_60-90.glb', //限速60-90"
  Speed_Limit_70: traffic_sign + 'Speed_Limit_70.glb', //限速70"
  Speed_Limit_80: traffic_sign + 'Speed_Limit_80.glb', //限速80"
  'Speed_Limit_80-100': traffic_sign + 'Speed_Limit_80-100.glb', //限速80-100"
  Speed_Limit_90: traffic_sign + 'Speed_Limit_90.glb', //限速90"
  'Speed_Limit_90-120': traffic_sign + 'Speed_Limit_90-120.glb', //限速90-120"
  Speed_Limit_100: traffic_sign + 'Speed_Limit_100.glb', //限速100"
  Speed_Limit_120: traffic_sign + 'Speed_Limit_120.glb', //限速120"
  Stop: traffic_sign + 'Stop.glb', //停止让行"
  Straight: traffic_sign + 'Straight.glb', //直行"
  Straight_And_Turn_Left: traffic_sign + 'Straight_And_Turn_Left.glb', //直行和向左转弯"
  Straight_And_Turn_Right: traffic_sign + 'Straight_And_Turn_Right.glb', //直行和向右转弯"
  'T_Crossing-3': traffic_sign + 'T_Crossing-3.glb', //T型交叉-3"
  Ten_Crossing: traffic_sign + 'Ten_Crossing.glb', //十字平面交叉"
  'Ten_Crossing-2': traffic_sign + 'Ten_Crossing-2.glb', //十字交叉2"
  Toll_Station_Ahead: traffic_sign + 'Toll_Station_Ahead.glb', //收费站"
  Traffic_Accident_Management: traffic_sign + 'Traffic_Accident_Management.glb', //交通事故管理"
  Tunnel_Mark: traffic_sign + 'Tunnel_Mark.glb', //隧道标志"
  Turn_Left: traffic_sign + 'Turn_Left.glb', //向左转弯"
  Turn_Left_And_Right: traffic_sign + 'Turn_Left_And_Right.glb', //向左和向右转弯"
  Turn_Left_Quickly: traffic_sign + 'Turn_Left_Quickly.glb', //向左急转弯"
  Turn_Right: traffic_sign + 'Turn_Right.glb', //向右转弯"
  Turn_Right_Quickly: traffic_sign + 'Turn_Right_Quickly.glb', //向右急转弯"
  U_Turn_Allowed: traffic_sign + 'U_Turn_Allowed.glb', //允许掉头"
  Uneven_Road: traffic_sign + 'Uneven_Road.glb', //路面不平"
  Unmanned_RailWay_Crossing: traffic_sign + 'Unmanned_RailWay_Crossing.glb', //无人看守铁道路口"
  Up_Steep_Slope: traffic_sign + 'Up_Steep_Slope.glb', //上陡坡"
  Variable_Speed_Limit_60: traffic_sign + 'Variable_Speed_Limit_60.glb', // 电子限速牌 限速60
  Variable_Speed_Limit_80: traffic_sign + 'Variable_Speed_Limit_80.glb', // 电子限速牌 限速80
  Variable_Speed_Limit_100: traffic_sign + 'Variable_Speed_Limit_100.glb', // 电子限速牌 限速100
  Walk_Sign: traffic_sign + 'Walk_Sign.glb', //步行"
  Weight_Limit_20: traffic_sign + 'Weight_Limit_20.glb', //限重20吨"
  Width_Limit_3: traffic_sign + 'Width_Limit_3.glb', //限宽3米"
  'Y_Crossing-1': traffic_sign + 'Y_Crossing-1.glb', //车辆汇入-左"
  'Y_Crossing-2': traffic_sign + 'Y_Crossing-2.glb', //车辆汇入-右"
  'Y_Crossing-4': traffic_sign + 'Y_Crossing-4.glb', //Y型交叉-4"
  Yield: traffic_sign + 'Yield.glb', //减速让行"
  // ---------------------------------------------------------------------------------------------- road 31 个   路面标识  name
  Arrow_Forward: rode_sign + 'Arrow_Forward.glb', //直行"
  Arrow_Forward_And_U_Turns: rode_sign + 'Arrow_Forward_And_U_Turns.glb', //直行掉头"
  Arrow_Left: rode_sign + 'Arrow_Left.glb', //左转"
  Arrow_Left_And_Forward: rode_sign + 'Arrow_Left_And_Forward.glb', //左转直行"
  Arrow_Left_And_Right: rode_sign + 'Arrow_Left_And_Right.glb', //左右转弯"
  Arrow_Left_And_U_Turns: rode_sign + 'Arrow_Left_And_U_Turns.glb', //左转掉头"
  Arrow_Right: rode_sign + 'Arrow_Right.glb', //右转"
  Arrow_Right_And_Forward: rode_sign + 'Arrow_Right_And_Forward.glb', //右转直行"
  Arrow_Turn_And_Straight: rode_sign + 'Arrow_Turn_And_Straight.glb', //转弯直行"
  Big_Cars_Lane_Line: rode_sign + 'Big_Cars_Lane_Line.glb', //大型车专用车道线"
  Bus_Only_Lane_Line: rode_sign + 'Bus_Only_Lane_Line.glb', //公交专用车道线"
  Circular_Center_Circle: rode_sign + 'Circular_Center_Circle.glb', //圆形中心圈"
  // Crosswalk_Line: rode_sign, //人行横道"   绘制 不用模型
  Crosswalk_Warning_Line: rode_sign + 'Crosswalk_Warning_Line.glb', //人行横道预告标识线"
  Maximum_RoadSurface_Speed_Limit_30: rode_sign + 'Maximum_RoadSurface_Speed_Limit_30.glb', //路面最高限速30"
  Mesh_Line: rode_sign + 'Mesh_Line.glb', //网状线"
  Minimum_RoadSurface_Speed_Limit_30: rode_sign + 'Minimum_RoadSurface_Speed_Limit_30.glb', //路面最低限速30"
  No_Left_Turn_LandMark: rode_sign + 'No_Left_Turn_LandMark.glb', //禁止左转"
  No_Right_Turn_LandMark: rode_sign + 'No_Right_Turn_LandMark.glb', //禁止右转"
  No_U_Turn_LandMark: rode_sign + 'No_U_Turn_LandMark.glb', //禁止掉头"
  Non_Motor_Vehicle: rode_sign + 'Non_Motor_Vehicle.glb', //非机动车标线"
  RailwayCrossingMarking: rode_sign + 'RailwayCrossingMarking.glb', //铁路平交道口标线"
  Rhombus_Center_Circle: rode_sign + 'Rhombus_Center_Circle.glb', //菱形中心圈"
  School_Area: rode_sign + 'School_Area.glb', //学校区域"
  // Slow_Down_To_Give_Way: rode_sign + 'Slow_Down_To_Give_Way.glb', //减速让行线" 用图片了
  Slow_down_to_give_way_InvertedTriangleSign: rode_sign + 'Slow_down_to_give_way_InvertedTriangleSign.glb', //减速让行线-倒三角"
  Small_Cars_Lane_Line: rode_sign + 'Small_Cars_Lane_Line.glb', //小型车专用车道线"
  // Stop_Line: rode_sign + 'Stop_Line.glb', //停止线"  用图片了
  // Stop_To_Give_Way: rode_sign + 'Stop_To_Give_Way.glb', //停止让行线" 用图片了
  Stop_to_give_way_StopSign: rode_sign + 'Stop_to_give_way_StopSign.glb', //停车让行线-停"
  Tide_Lane: rode_sign + 'Tide_Lane.glb', //潮汐车道"
  Turn_And_Merge_Left: rode_sign + 'Turn_And_Merge_Left.glb', //左弯合流"
  Turn_And_Merge_Right: rode_sign + 'Turn_And_Merge_Right.glb', //右弯合流"
  Turn_Left_Waiting: rode_sign + 'Turn_Left_Waiting.glb', //左弯待转区线"
  U_Turns: rode_sign + 'U_Turns.glb', //掉头"
  // ----------------------------------------------------------------------------------------------object 54 个   物体 name
  Asphalt_Line: obj_model + 'Asphalt_Line.glb', // 沥青线"
  // Bridge: obj_model, // 桥梁  没做
  Building: obj_model + 'Building.glb', // 建筑物"
  Bus_Stop: obj_model + 'Bus_Stop.glb', // 公交车站"
  Bus_Stop_2: obj_model + 'Bus_Stop_2.glb', // 公交车站"
  Bus_Stop_3: obj_model + 'Bus_Stop_3.glb', // 公交车站"
  Bus_Stop_4: obj_model + 'Bus_Stop_4.glb', // 公交车站"
  Bus_Stop_5: obj_model + 'Bus_Stop_5.glb', // 公交车站"
  Camera: obj_model + 'Camera.glb', // 摄像头"
  Cantilever_Pole: obj_model + 'Cantilever_Pole.glb', // 悬臂式柱"
  Charging_Station: obj_model + 'Charging_Station.glb', // 充电桩"
  Collision_Resistant_Barrel: obj_model + 'Collision_Resistant_Barrel.glb', // 防撞桶"
  Crack: obj_model + 'Crack.glb', // 裂缝"
  // CustomParkingSpace: obj_model, // 自定义停车位"  代码实现
  Deceleration_Zone: obj_model + 'Deceleration_Zone.glb', // 减速带"
  EmergencyMedicalServiceStation: obj_model + 'EmergencyMedicalServiceStation.glb', // 急救站"
  FireHydrant: obj_model + 'FireHydrant.glb', // 消防栓"
  FireStation: obj_model + 'FireStation.glb', // 消防队"
  GarbageCan: obj_model + 'GarbageCan.glb', // 垃圾桶"
  Gas_Station: obj_model + 'Gas_Station.glb', // 加油站"
  Grass: obj_model + 'Grass.glb', // 草坪"
  Ground_Lock: obj_model + 'Ground_Lock.glb', // 地锁"
  Hospital: obj_model + 'Hospital.glb', // 医院"
  Lamp: obj_model + 'Lamp.glb', // 路灯"
  ManholeCover: obj_model + 'ManholeCover.glb', // 井盖"
  Market: obj_model + 'Market.glb', // 集市"
  Millimeter_Wave_Radar: obj_model + 'Millimeter_Wave_Radar.glb', // 毫米波雷达"
  Obstacle: obj_model + 'Obstacle.glb', // 障碍物"
  Oil_Stain: obj_model + 'Oil_Stain.glb', // 油渍"
  // Parking_5m: obj_model + 'Parking_5m.glb', // 5米停车位" 代码实现
  // Parking_6m: obj_model + 'Parking_6m.glb', // 6米停车位" 代码实现
  // Parking_45deg: obj_model + 'Parking_45deg.glb', // 45°停车位" 代码实现
  // Parking_60deg: obj_model + 'Parking_60deg.glb', // 60°停车位" 代码实现
  Parking_Hole: obj_model + 'Parking_Hole.glb', // 停车杆"
  Parking_Limit_Position_Pole_2m: obj_model + 'Parking_Limit_Position_Pole_2m.glb', // 限位杆"
  Parking_Lot: obj_model + 'Parking_Lot.glb', // 停车桩"
  Parking_StructurePillar: obj_model + 'Parking_StructurePillar.glb', // 停车库柱子"
  Patch: obj_model + 'Patch.glb', // 补丁"
  Pillar_Pole_3m: obj_model + 'Pillar_Pole_3m.glb', // 3米柱"
  Pillar_Pole_6m: obj_model + 'Pillar_Pole_6m.glb', // 6米柱"
  Plastic_Vehicle_Stopper: obj_model + 'Plastic_Vehicle_Stopper.glb', // 塑胶挡车器"
  Pothole: obj_model + 'Pothole.glb', // 坑洼"
  Protrusion: obj_model + 'Protrusion.glb', // 凸起"
  Reflective_Road_Sign: obj_model + 'Reflective_Road_Sign.glb', // 反光路标"
  ResidentialCommunity: obj_model + 'ResidentialCommunity.glb', // 居民小区"
  Road_Curb: obj_model + 'Road_Curb.glb', // 路沿"
  Rut_Track: obj_model + 'Rut_Track.glb', // 车轮痕迹"
  School: obj_model + 'School.glb', // 学校"
  Shrub: obj_model + 'Shrub.glb', // 灌木"
  Snow_Cover: obj_model + 'Snow_Cover.glb', // 积雪"
  Stagnant_Water: obj_model + 'Stagnant_Water.glb', // 积水"
  Support_Vehicle_Stopper: obj_model + 'Support_Vehicle_Stopper.glb', // 支撑型挡车器"
  Toll: obj_model + 'Toll.glb', // 收费站"
  StartingPoint: obj_model + 'StartingPoint.glb', // 起点"
  Traffic_Barrier: obj_model + 'Traffic_Barrier.glb', // 交通护栏"
  Traffic_Bucket: obj_model + 'Traffic_Bucket.glb', // 交通桶"
  Tree: obj_model + 'Tree.glb', // 树木"
  Tunnel: obj_model + 'Tunnel.glb', // 隧道"
  // Tunnel_door: obj_model + 'Tunnel_door.glb', // 隧道"
  UnderGroundParking_GateUp: obj_model + 'UnderGroundParking_GateUp.glb', // 地库抬杆"
  Traffic_Cone: obj_model + 'Traffic_Cone.glb',
  Water_Bollard: obj_model + 'Water_Bollard.glb', // 水马"
  // ----------------------------------------------------------------------------------------------车模 45个
  默认: vehicle + 'default.glb',
  '默认 黑色': vehicle + 'default_black.glb',
  '默认 白色': vehicle + 'default_white.glb',
  '默认 红色': vehicle + 'default_red.glb',
  摩托车: vehicle + 'Motorcycle.glb',
  自行车: vehicle + 'bike.glb',
  骑行者: vehicle + 'rider.glb',
  两轮电动车: vehicle + 'BEV.glb',
  三轮车: vehicle + 'tricycle.glb',
  '哈弗 H6': vehicle + 'HAVAL_H6.glb',
  '奥迪 A3 2.0T': vehicle + 'A3_20T.glb',
  '奥迪 A3 两厢版': vehicle + 'A3.glb',
  '奥迪 A3 1.4T': vehicle + 'A3_14T.glb',
  '奥迪 Q3': vehicle + 'Q3.glb',
  '大众 宝来': vehicle + 'Bora.glb',
  '大众 高尔夫': vehicle + 'GOLF.glb',
  '大众 高尔夫嘉旅': vehicle + 'GOLF_Sportsvan.glb',
  '大众 迈腾': vehicle + 'MAGOTAN.glb',
  '大众 帕萨特': vehicle + 'PASSAT.glb',
  '大众 速腾': vehicle + 'Sagitar.glb',
  '大众 探岳': vehicle + 'TAYRON.glb',
  '大众 途昂': vehicle + 'Teramont.glb',
  '大众 途观': vehicle + 'Tiguan.glb',
  '大众 捷达': vehicle + 'Jetta.glb',
  '吉利 博瑞': vehicle + 'Borui.glb',
  '斯柯达 科迪亚克': vehicle + 'Kodiaq.glb',
  '斯柯达 明锐': vehicle + 'Octavia.glb',
  '斯柯达 速派': vehicle + 'Superb.glb',
  '一汽 红旗': vehicle + 'Hongqi.glb',
  '一汽 红旗 蓝色': vehicle + 'Hongqi_blue.glb',
  '一汽 红旗 黑色': vehicle + 'Hongqi_black.glb',
  '一汽 红旗 白色': vehicle + 'Hongqi_white.glb',
  '一汽 红旗 红色': vehicle + 'Hongqi_red.glb',
  '小米 SU7 蓝色': vehicle + 'SU7_blue.glb',
  'Xiaomi SU7 Blue': vehicle + 'SU7_blue.glb',
  '小米 SU7 灰色': vehicle + 'SU7_Gray.glb',
  'Xiaomi SU7 Gray': vehicle + 'SU7_Gray.glb',
  '小米 SU7 橘色': vehicle + 'SU7_origin.glb',
  'Xiaomi SU7 Orange': vehicle + 'SU7_origin.glb',
  '小米 SU7 紫色': vehicle + 'SU7_pink.glb',
  'Xiaomi SU7 Purple': vehicle + 'SU7_pink.glb',
  MPV: vehicle + 'MPV.glb',
  警车: vehicle + 'policeCar.glb',
  公交车: vehicle + 'Gongjiao.glb',
  卡车: vehicle + 'Kache.glb',
  农用车: vehicle + 'Nongyongche.glb',
  消防车: vehicle + 'FireTruck.glb',
  救护车: vehicle + 'Ambulance.glb',
  校车: vehicle + 'SchoolBus.glb',
  other: vehicle + 'default.glb',
  // ----------------------------------------------------------------------------------------------人模 3个
  cally: people + 'people1.glb',
  小孩: people + 'Child.glb',
  狗: people + 'dog.glb',
  // ----------------------------------------------------------------------------------------------物模 22个
  交通锥: obj_model + 'Traffic_cone.glb',
  窨井盖: object + 'Manhole_cover.glb',
  'RSU-1': object + 'RSU_1.glb',
  'RSU-2': object + 'RSU_2.glb',
  三角警示架: object + 'WarningTriangle.glb',
  水马防撞桶: object + 'water_tong.glb',
  箱子: object + 'Box.glb',
  水马围挡: object + 'water_weilan.glb',
  树枝: object + 'TreeBranch.glb',
  '轮胎-竖': object + 'Wheel_colum.glb',
  '轮胎-横': object + 'Wheel_row.glb',
  UWB基站: object + 'UWB.glb',
  水马: object + 'water_shuima.glb',
  护栏: object + 'Guardrail.glb',
  前方道路施工标志牌: object + 'RoadWorkSign.glb',
  井盖_开: object + 'Manhole_cover_open.glb',
  路面坑洼: object + 'Pothole.glb',
  路面凸起: object + 'Road_hump.glb',
  积水坑: object + 'Water_filled.glb',
  积雪堆: object + 'Snowdrift.glb',
  车辙印: object + 'Wheel_track.glb',
  裂缝: object + 'Crack.glb',
  // 图片
  Stop_Line: stopLine,
  Slow_Down_To_Give_Way: SlowDownToGiveWay,
  Stop_To_Give_Way: StopToGiveWay
}

const vehicle_fbx = '/models/vehicle/'
export const FBX_URL = {
  默认: vehicle_fbx + 'default.fbx',
  '默认 黑色': vehicle_fbx + 'default_black.fbx',
  '默认 白色': vehicle_fbx + 'default_white.fbx',
  '默认 红色': vehicle_fbx + 'default_red.fbx',
  摩托车: vehicle_fbx + 'Motorcycle.fbx',
  自行车: vehicle_fbx + 'bike.fbx',
  骑行者: vehicle_fbx + 'rider.fbx',
  两轮电动车: vehicle_fbx + 'BEV.fbx',
  三轮车: vehicle_fbx + 'tricycle.fbx',
  '哈弗 H6': vehicle_fbx + 'HAVAL_H6.fbx',
  '奥迪 A3 2.0T': vehicle_fbx + 'A3_20T.fbx',
  '奥迪 A3 两厢版': vehicle_fbx + 'A3.fbx',
  '奥迪 A3 1.4T': vehicle_fbx + 'A3_14T.fbx',
  '奥迪 Q3': vehicle_fbx + 'Q3.fbx',
  '大众 宝来': vehicle_fbx + 'Bora.fbx',
  '大众 高尔夫': vehicle_fbx + 'GOLF.fbx',
  '大众 高尔夫嘉旅': vehicle_fbx + 'GOLF_Sportsvan.fbx',
  '大众 迈腾': vehicle_fbx + 'MAGOTAN.fbx',
  '大众 帕萨特': vehicle_fbx + 'PASSAT.fbx',
  '大众 速腾': vehicle_fbx + 'Sagitar.fbx',
  '大众 探岳': vehicle_fbx + 'TAYRON.fbx',
  '大众 途昂': vehicle_fbx + 'Teramont.fbx',
  '大众 途观': vehicle_fbx + 'Tiguan.fbx',
  '大众 捷达': vehicle_fbx + 'Jetta.fbx',
  '吉利 博瑞': vehicle_fbx + 'Borui.fbx',
  '斯柯达 科迪亚克': vehicle_fbx + 'Kodiaq.fbx',
  '斯柯达 明锐': vehicle_fbx + 'Octavia.fbx',
  '斯柯达 速派': vehicle_fbx + 'Superb.fbx',
  '一汽 红旗': vehicle_fbx + 'Hongqi.fbx',
  '一汽 红旗 蓝色': vehicle_fbx + 'Hongqi_blue.fbx',
  '一汽 红旗 黑色': vehicle_fbx + 'Hongqi_black.fbx',
  '一汽 红旗 白色': vehicle_fbx + 'Hongqi_white.fbx',
  '一汽 红旗 红色': vehicle_fbx + 'Hongqi_red.fbx',
  '小米 SU7 蓝色': vehicle_fbx + 'SU7_blue.fbx',
  'Xiaomi SU7 Blue': vehicle_fbx + 'SU7_blue.fbx',
  '小米 SU7 灰色': vehicle_fbx + 'SU7_Gray.fbx',
  'Xiaomi SU7 Gray': vehicle_fbx + 'SU7_Gray.fbx',
  '小米 SU7 橘色': vehicle_fbx + 'SU7_origin.fbx',
  'Xiaomi SU7 Orange': vehicle_fbx + 'SU7_origin.fbx',
  '小米 SU7 紫色': vehicle_fbx + 'SU7_pink.fbx',
  'Xiaomi SU7 Purple': vehicle_fbx + 'SU7_pink.fbx',
  MPV: vehicle_fbx + 'MPV.fbx',
  警车: vehicle_fbx + 'policeCar.fbx',
  公交车: vehicle_fbx + 'Gongjiao.fbx',
  卡车: vehicle_fbx + 'Kache.fbx',
  农用车: vehicle_fbx + 'Nongyongche.fbx',
  消防车: vehicle_fbx + 'FireTruck.fbx',
  救护车: vehicle_fbx + 'Ambulance.fbx',
  校车: vehicle_fbx + 'SchoolBus.fbx',
  other: vehicle_fbx + 'default.fbx',
}

export const GLB_URL = {
  默认: vehicle + 'default.glb',
  '默认 黑色': vehicle + 'default_black.glb',
  '默认 白色': vehicle + 'default_white.glb',
  '默认 红色': vehicle + 'default_red.glb',
  摩托车: vehicle + 'Motorcycle.glb',
  自行车: vehicle + 'bike.glb',
  骑行者: vehicle + 'rider.glb',
  两轮电动车: vehicle + 'BEV.glb',
  三轮车: vehicle + 'tricycle.glb',
  '哈弗 H6': vehicle + 'HAVAL_H6.glb',
  '奥迪 A3 2.0T': vehicle + 'A3_20T.glb',
  '奥迪 A3 两厢版': vehicle + 'A3.glb',
  '奥迪 A3 1.4T': vehicle + 'A3_14T.glb',
  '奥迪 Q3': vehicle + 'Q3.glb',
  '大众 宝来': vehicle + 'Bora.glb',
  '大众 高尔夫': vehicle + 'GOLF.glb',
  '大众 高尔夫嘉旅': vehicle + 'GOLF_Sportsvan.glb',
  '大众 迈腾': vehicle + 'MAGOTAN.glb',
  '大众 帕萨特': vehicle + 'PASSAT.glb',
  '大众 速腾': vehicle + 'Sagitar.glb',
  '大众 探岳': vehicle + 'TAYRON.glb',
  '大众 途昂': vehicle + 'Teramont.glb',
  '大众 途观': vehicle + 'Tiguan.glb',
  '大众 捷达': vehicle + 'Jetta.glb',
  '吉利 博瑞': vehicle + 'Borui.glb',
  '斯柯达 科迪亚克': vehicle + 'Kodiaq.glb',
  '斯柯达 明锐': vehicle + 'Octavia.glb',
  '斯柯达 速派': vehicle + 'Superb.glb',
  '一汽 红旗': vehicle + 'Hongqi.glb',
  '一汽 红旗 蓝色': vehicle + 'Hongqi_blue.glb',
  '一汽 红旗 黑色': vehicle + 'Hongqi_black.glb',
  '一汽 红旗 白色': vehicle + 'Hongqi_white.glb',
  '一汽 红旗 红色': vehicle + 'Hongqi_red.glb',
  '小米 SU7 蓝色': vehicle + 'SU7_blue.glb',
  'Xiaomi SU7 Blue': vehicle + 'SU7_blue.glb',
  '小米 SU7 灰色': vehicle + 'SU7_Gray.glb',
  'Xiaomi SU7 Gray': vehicle + 'SU7_Gray.glb',
  '小米 SU7 橘色': vehicle + 'SU7_origin.glb',
  'Xiaomi SU7 Orange': vehicle + 'SU7_origin.glb',
  '小米 SU7 紫色': vehicle + 'SU7_pink.glb',
  'Xiaomi SU7 Purple': vehicle + 'SU7_pink.glb',
  MPV: vehicle + 'MPV.glb',
  警车: vehicle + 'policeCar.glb',
  公交车: vehicle + 'Gongjiao.glb',
  卡车: vehicle + 'Kache.glb',
  农用车: vehicle + 'Nongyongche.glb',
  消防车: vehicle + 'FireTruck.glb',
  救护车: vehicle + 'Ambulance.glb',
  校车: vehicle + 'SchoolBus.glb',
  other: vehicle + 'default.glb',
}