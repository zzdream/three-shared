
import stopLine from '@/assets/images/stopLine.png'
import SlowDownToGiveWay from '@/assets/images/SlowDownToGiveWay.png'
import StopToGiveWay from '@/assets/images/StopToGiveWay.png'
// 交通标识
const rode_sign = '/models/roadSign_model/'
const traffic_sign = '/models/traffic_sign_model/'
const obj_model = '/models/obj_model/'
const traffic_light = '/models/traffic_light_model/'
const vehicle = '/models/vehicle/'
const people = '/models/people/'
const object = '/models/object/'
export const MODAL_TO_URL: any = {
  // signal  ----------------------------------------------------------------------------------------------交通灯 7 个 type_subtype
  车道信号灯_0: traffic_light + '车道信号灯_RedLight.fbx',
  车道信号灯_2: traffic_light + '车道信号灯_GreenLight.fbx',
  车道信号灯: traffic_light + '车道信号灯.fbx',
  横排全方位灯_0: traffic_light + '横排全方位灯_RedLight.fbx',
  横排全方位灯_1: traffic_light + '横排全方位灯_YellowLight.fbx',
  横排全方位灯_2: traffic_light + '横排全方位灯_GreenLight.fbx',
  横排全方位灯: traffic_light + '横排全方位灯.fbx',
  横向右转灯_0: traffic_light + '横向右转灯_RedLight.fbx',
  横向右转灯_1: traffic_light + '横向右转灯_YellowLight.fbx',
  横向右转灯_2: traffic_light + '横向右转灯_GreenLight.fbx',
  横向右转灯: traffic_light + '横向右转灯.fbx',
  横向直行灯_0: traffic_light + '横向直行灯_RedLight.fbx',
  横向直行灯_1: traffic_light + '横向直行灯_YellowLight.fbx',
  横向直行灯_2: traffic_light + '横向直行灯_GreenLight.fbx',
  横向直行灯: traffic_light + '横向直行灯.fbx',
  横向左转灯_0: traffic_light + '横向左转灯_RedLight.fbx',
  横向左转灯_1: traffic_light + '横向左转灯_YellowLight.fbx',
  横向左转灯_2: traffic_light + '横向左转灯_GreenLight.fbx',
  横向左转灯: traffic_light + '横向左转灯.fbx',
  竖排全方位灯_0: traffic_light + '竖排全方位灯_RedLight.fbx',
  竖排全方位灯_1: traffic_light + '竖排全方位灯_YellowLight.fbx',
  竖排全方位灯_2: traffic_light + '竖排全方位灯_GreenLight.fbx',
  竖排全方位灯: traffic_light + '竖排全方位灯.fbx',
  竖排直行灯_0: traffic_light + '竖排直行灯_RedLight.fbx',
  竖排直行灯_1: traffic_light + '竖排直行灯_YellowLight.fbx',
  竖排直行灯_2: traffic_light + '竖排直行灯_GreenLight.fbx',
  竖排直行灯: traffic_light + '竖排直行灯.fbx',
  竖排左转灯_0: traffic_light + '竖排左转灯_RedLight.fbx',
  竖排左转灯_1: traffic_light + '竖排左转灯_YellowLight.fbx',
  竖排左转灯_2: traffic_light + '竖排左转灯_GreenLight.fbx',
  竖排左转灯: traffic_light + '竖排左转灯.fbx',
  竖排右转灯_0: traffic_light + '竖排右转灯_RedLight.fbx',
  竖排右转灯_1: traffic_light + '竖排右转灯_YellowLight.fbx',
  竖排右转灯_2: traffic_light + '竖排右转灯_GreenLight.fbx',
  竖排右转灯: traffic_light + '竖排右转灯.fbx',
  单车指示灯_0: traffic_light + '单车指示灯_RedLight.fbx',
  单车指示灯_2: traffic_light + '单车指示灯_GreenLight.fbx',
  单车指示灯: traffic_light + '单车指示灯.fbx',
  竖排人行灯_0: traffic_light + '竖排人行灯_RedLight.fbx',
  竖排人行灯_2: traffic_light + '竖排人行灯_GreenLight.fbx',
  竖排人行灯: traffic_light + '竖排人行灯.fbx',
  双色指示灯_0: traffic_light + '双色指示灯_RedLight.fbx',
  双色指示灯_2: traffic_light + '双色指示灯_GreenLight.fbx',
  双色指示灯: traffic_light + '双色指示灯.fbx',
  // signal -----------------------------------------------------------------------------------------------交通标识 126 个
  Attention: traffic_sign + 'Attention.fbx', // 注意危险"
  'Attention_ To_Confluence': traffic_sign + 'Attention_ To_Confluence.fbx', //注意合流"
  'Attention_ To_Keep_Distance': traffic_sign + 'Attention_ To_Keep_Distance.fbx', //注意保持车距"
  Attention_Disabled_Individuals: traffic_sign + 'Attention_Disabled_Individuals.fbx', //注意残疾人"
  Attention_Lane_Reduction_Ahead_1: traffic_sign + 'Attention_Lane_Reduction_Ahead_1.fbx', //注意车道数变少-1"
  Attention_Lane_Reduction_Ahead_2: traffic_sign + 'Attention_Lane_Reduction_Ahead_2.fbx', //注意车道数变少-2"
  Attention_Signal: traffic_sign + 'Attention_Signal.fbx', //注意信号灯"
  Attention_Tide_Lanes: traffic_sign + 'Attention_Tide_Lanes.fbx', //注意潮汐车道"
  Automated_Toll_Lane: traffic_sign + 'Automated_Toll_Lane.fbx', //ETC车道"
  Bilateral_Traffic: traffic_sign + 'Bilateral_Traffic.fbx', //双向交通标志"
  Cancle_No_OverTaking: traffic_sign + 'Cancle_No_OverTaking.fbx', //解除禁止超车"
  Circle_Crossing: traffic_sign + 'Circle_Crossing.fbx', //环形交叉"
  Combined_Speed_Limit_Sign_1: traffic_sign + 'Combined_Speed_Limit_Sign_1.fbx', //组合限速标志1"
  Construction_Mark: traffic_sign + 'Construction_Mark.fbx', //施工标志"
  Continuous_DownSlopes: traffic_sign + 'Continuous_DownSlopes.fbx', //连续下坡"
  Crosswalk: traffic_sign + 'Crosswalk.fbx', //人行横道"
  Detour_On_The_Left: traffic_sign + 'Detour_On_The_Left.fbx', //左侧绕行"
  Detour_On_The_LeftAndRight: traffic_sign + 'Detour_On_The_LeftAndRight.fbx', //左右绕行"
  Detour_On_The_Right: traffic_sign + 'Detour_On_The_Right.fbx', //右侧绕行"
  Ding_Flat_Crossing: traffic_sign + 'Ding_Flat_Crossing.fbx', //丁字平面交叉"
  Down_Steep_Slope: traffic_sign + 'Down_Steep_Slope.fbx', //下陡坡"
  ETC_Lane_InnerSide: traffic_sign + 'ETC_Lane_InnerSide.fbx', //ETC车道指引-内侧"
  Flyover_Straight_And_TurnLeft: traffic_sign + 'Flyover_Straight_And_TurnLeft.fbx', //立体交叉直行和左转弯行驶"
  Flyover_Straight_And_TurnRight: traffic_sign + 'Flyover_Straight_And_TurnRight.fbx', //立体交叉直行和右转弯行驶"
  Give_Way: traffic_sign + 'Give_Way.fbx', //会车让行"
  'Height_Limit_2.5': traffic_sign + 'Height_Limit_2.5.fbx', //限高2.5米"
  'Height_Limit_3.5': traffic_sign + 'Height_Limit_3.5.fbx', //限高3.5米"
  Height_Limit_5: traffic_sign + 'Height_Limit_5.fbx', //限高5米"
  LeftSide_Of_The_Road_Driving: traffic_sign + 'LeftSide_Of_The_Road_Driving.fbx', //靠左侧道路行驶"
  Long_Curve_Road: traffic_sign + 'Long_Curve_Road.fbx', //连续弯路"
  Manual_Toll_Lane: traffic_sign + 'Manual_Toll_Lane.fbx', //人工收费车道"
  Minimum_Speed_Limit_40: traffic_sign + 'Minimum_Speed_Limit_40.fbx', //最低限速40"
  Minimum_Speed_Limit_50: traffic_sign + 'Minimum_Speed_Limit_50.fbx', //最低限速50"
  Minimum_Speed_Limit_60: traffic_sign + 'Minimum_Speed_Limit_60.fbx', //最低限速60"
  MotorVehicle_Driving: traffic_sign + 'MotorVehicle_Driving.fbx', //机动车行驶"
  Mountain_DropOff_Left: traffic_sign + 'Mountain_DropOff_Left.fbx', //左侧傍山险路"
  Mountain_DropOff_Right: traffic_sign + 'Mountain_DropOff_Right.fbx', //右侧傍山险路"
  Narrow_Road_BothSide: traffic_sign + 'Narrow_Road_BothSide.fbx', //窄路两侧变窄"
  Narrow_Road_Left: traffic_sign + 'Narrow_Road_Left.fbx', //窄路左侧变窄"
  Narrow_Road_Right: traffic_sign + 'Narrow_Road_Right.fbx', //窄路右侧变窄"
  No_Buses_Entry: traffic_sign + 'No_Buses_Entry.fbx', //禁止大型客车驶入"
  No_Entry: traffic_sign + 'No_Entry.fbx', //禁止驶入"
  No_Left_Right_Turn: traffic_sign + 'No_Left_Right_Turn.fbx', //禁止左右转"
  No_Left_Turn: traffic_sign + 'No_Left_Turn.fbx', //禁止左转"
  No_Long_Time_Parking: traffic_sign + 'No_Long_Time_Parking.fbx', //禁止长时停车"
  No_MotorVehicle_Entry: traffic_sign + 'No_MotorVehicle_Entry.fbx', //禁止机动车驶入"
  No_Motorcycle_Entry: traffic_sign + 'No_Motorcycle_Entry.fbx', //禁止二轮摩托车驶入"
  No_NonMotorVehicle_Entry: traffic_sign + 'No_NonMotorVehicle_Entry.fbx', //禁止非机动车进入"
  No_OverTaking: traffic_sign + 'No_OverTaking.fbx', //禁止超车"
  No_Parking: traffic_sign + 'No_Parking.fbx', //禁止停车"
  No_Passing: traffic_sign + 'No_Passing.fbx', //禁止通行"
  No_Pedestrians: traffic_sign + 'No_Pedestrians.fbx', //禁止行人"
  No_Right_Turn: traffic_sign + 'No_Right_Turn.fbx', //禁止右转"
  No_Straight: traffic_sign + 'No_Straight.fbx', //禁止直行"
  No_Straight_Left_Turn: traffic_sign + 'No_Straight_Left_Turn.fbx', //禁止直行左转"
  No_Straight_Right_Turn: traffic_sign + 'No_Straight_Right_Turn.fbx', //禁止直行右转"
  No_Tractor_Entry: traffic_sign + 'No_Tractor_Entry.fbx', //禁止拖拉机驶入"
  No_U_Turn: traffic_sign + 'No_U_Turn.fbx', //禁止掉头"
  Non_MotorVehicle_Driving: traffic_sign + 'Non_MotorVehicle_Driving.fbx', //非机动车行驶"
  Parking_And_Be_Checked: traffic_sign + 'Parking_And_Be_Checked.fbx', //停车检查"
  Parkingspace: traffic_sign + 'Parkingspace.fbx', //停车场"
  Passable_Lane: traffic_sign + 'Passable_Lane.fbx', //绿色通道"
  Pay_Attention_To_Children: traffic_sign + 'Pay_Attention_To_Children.fbx', //注意儿童"
  Pay_Attention_To_NonMotorVehicle: traffic_sign + 'Pay_Attention_To_NonMotorVehicle.fbx', //注意非机动车"
  Pay_Attention_To_Pedestrians: traffic_sign + 'Pay_Attention_To_Pedestrians.fbx', //注意行人"
  Ramp_Ahead: traffic_sign + 'Ramp_Ahead.fbx', //匝道"
  Remove_Speed_Limit_10: traffic_sign + 'Remove_Speed_Limit_10.fbx', //解除限速10"
  Remove_Speed_Limit_20: traffic_sign + 'Remove_Speed_Limit_20.fbx', //解除限速20"
  Remove_Speed_Limit_30: traffic_sign + 'Remove_Speed_Limit_30.fbx', //解除限速30"
  Remove_Speed_Limit_40: traffic_sign + 'Remove_Speed_Limit_40.fbx', //解除限速40"
  Remove_Speed_Limit_50: traffic_sign + 'Remove_Speed_Limit_50.fbx', //解除限速50"
  Remove_Speed_Limit_60: traffic_sign + 'Remove_Speed_Limit_60.fbx', //解除限速60"
  Remove_Speed_Limit_70: traffic_sign + 'Remove_Speed_Limit_70.fbx', //解除限速70"
  Remove_Speed_Limit_80: traffic_sign + 'Remove_Speed_Limit_80.fbx', //解除限速80"
  Remove_Speed_Limit_90: traffic_sign + 'Remove_Speed_Limit_90.fbx', //解除限速90"
  Remove_Speed_Limit_100: traffic_sign + 'Remove_Speed_Limit_100.fbx', //解除限速100"
  Remove_Speed_Limit_120: traffic_sign + 'Remove_Speed_Limit_120.fbx', //解除限速120"
  Reverse_Detour_Left: traffic_sign + 'Reverse_Detour_Left.fbx', //反向弯路-左"
  Reverse_Detour_Right: traffic_sign + 'Reverse_Detour_Right.fbx', //反向弯路-右"
  Regional_Speed_Limit_10: traffic_sign + 'Regional_Speed_Limit_10.fbx', // 限速10区域
  RightSide_Of_The_Road_Driving: traffic_sign + 'RightSide_Of_The_Road_Driving.fbx', //靠右侧道路行驶"
  RoundAbout_Driving: traffic_sign + 'RoundAbout_Driving.fbx', //环岛行驶"
  Slow_Driving: traffic_sign + 'Slow_Driving.fbx', //慢行"
  Speed_Limit_10: traffic_sign + 'Speed_Limit_10.fbx', //限速10"
  Speed_Limit_20: traffic_sign + 'Speed_Limit_20.fbx', //限速20"
  Speed_Limit_30: traffic_sign + 'Speed_Limit_30.fbx', //限速30"
  Speed_Limit_40: traffic_sign + 'Speed_Limit_40.fbx', //限速40"
  Speed_Limit_50: traffic_sign + 'Speed_Limit_50.fbx', //限速50"
  Speed_Limit_60: traffic_sign + 'Speed_Limit_60.fbx', //限速60"
  'Speed_Limit_60-90': traffic_sign + 'Speed_Limit_60-90.fbx', //限速60-90"
  Speed_Limit_70: traffic_sign + 'Speed_Limit_70.fbx', //限速70"
  Speed_Limit_80: traffic_sign + 'Speed_Limit_80.fbx', //限速80"
  'Speed_Limit_80-100': traffic_sign + 'Speed_Limit_80-100.fbx', //限速80-100"
  Speed_Limit_90: traffic_sign + 'Speed_Limit_90.fbx', //限速90"
  'Speed_Limit_90-120': traffic_sign + 'Speed_Limit_90-120.fbx', //限速90-120"
  Speed_Limit_100: traffic_sign + 'Speed_Limit_100.fbx', //限速100"
  Speed_Limit_120: traffic_sign + 'Speed_Limit_120.fbx', //限速120"
  Stop: traffic_sign + 'Stop.fbx', //停止让行"
  Straight: traffic_sign + 'Straight.fbx', //直行"
  Straight_And_Turn_Left: traffic_sign + 'Straight_And_Turn_Left.fbx', //直行和向左转弯"
  Straight_And_Turn_Right: traffic_sign + 'Straight_And_Turn_Right.fbx', //直行和向右转弯"
  'T_Crossing-3': traffic_sign + 'T_Crossing-3.fbx', //T型交叉-3"
  Ten_Crossing: traffic_sign + 'Ten_Crossing.fbx', //十字平面交叉"
  'Ten_Crossing-2': traffic_sign + 'Ten_Crossing-2.fbx', //十字交叉2"
  Toll_Station_Ahead: traffic_sign + 'Toll_Station_Ahead.fbx', //收费站"
  Traffic_Accident_Management: traffic_sign + 'Traffic_Accident_Management.fbx', //交通事故管理"
  Tunnel_Mark: traffic_sign + 'Tunnel_Mark.fbx', //隧道标志"
  Turn_Left: traffic_sign + 'Turn_Left.fbx', //向左转弯"
  Turn_Left_And_Right: traffic_sign + 'Turn_Left_And_Right.fbx', //向左和向右转弯"
  Turn_Left_Quickly: traffic_sign + 'Turn_Left_Quickly.fbx', //向左急转弯"
  Turn_Right: traffic_sign + 'Turn_Right.fbx', //向右转弯"
  Turn_Right_Quickly: traffic_sign + 'Turn_Right_Quickly.fbx', //向右急转弯"
  U_Turn_Allowed: traffic_sign + 'U_Turn_Allowed.fbx', //允许掉头"
  Uneven_Road: traffic_sign + 'Uneven_Road.fbx', //路面不平"
  Unmanned_RailWay_Crossing: traffic_sign + 'Unmanned_RailWay_Crossing.fbx', //无人看守铁道路口"
  Up_Steep_Slope: traffic_sign + 'Up_Steep_Slope.fbx', //上陡坡"
  Variable_Speed_Limit_60: traffic_sign + 'Variable_Speed_Limit_60.fbx', // 电子限速牌 限速60
  Variable_Speed_Limit_80: traffic_sign + 'Variable_Speed_Limit_80.fbx', // 电子限速牌 限速80
  Variable_Speed_Limit_100: traffic_sign + 'Variable_Speed_Limit_100.fbx', // 电子限速牌 限速100
  Walk_Sign: traffic_sign + 'Walk_Sign.fbx', //步行"
  Weight_Limit_20: traffic_sign + 'Weight_Limit_20.fbx', //限重20吨"
  Width_Limit_3: traffic_sign + 'Width_Limit_3.fbx', //限宽3米"
  'Y_Crossing-1': traffic_sign + 'Y_Crossing-1.fbx', //车辆汇入-左"
  'Y_Crossing-2': traffic_sign + 'Y_Crossing-2.fbx', //车辆汇入-右"
  'Y_Crossing-4': traffic_sign + 'Y_Crossing-4.fbx', //Y型交叉-4"
  Yield: traffic_sign + 'Yield.fbx', //减速让行"
  // ---------------------------------------------------------------------------------------------- road 31 个   路面标识  name
  Arrow_Forward: rode_sign + 'Arrow_Forward.fbx', //直行"
  Arrow_Forward_And_U_Turns: rode_sign + 'Arrow_Forward_And_U_Turns.fbx', //直行掉头"
  Arrow_Left: rode_sign + 'Arrow_Left.fbx', //左转"
  Arrow_Left_And_Forward: rode_sign + 'Arrow_Left_And_Forward.fbx', //左转直行"
  Arrow_Left_And_Right: rode_sign + 'Arrow_Left_And_Right.fbx', //左右转弯"
  Arrow_Left_And_U_Turns: rode_sign + 'Arrow_Left_And_U_Turns.fbx', //左转掉头"
  Arrow_Right: rode_sign + 'Arrow_Right.fbx', //右转"
  Arrow_Right_And_Forward: rode_sign + 'Arrow_Right_And_Forward.fbx', //右转直行"
  Arrow_Turn_And_Straight: rode_sign + 'Arrow_Turn_And_Straight.fbx', //转弯直行"
  Big_Cars_Lane_Line: rode_sign + 'Big_Cars_Lane_Line.fbx', //大型车专用车道线"
  Bus_Only_Lane_Line: rode_sign + 'Bus_Only_Lane_Line.fbx', //公交专用车道线"
  Circular_Center_Circle: rode_sign + 'Circular_Center_Circle.fbx', //圆形中心圈"
  // Crosswalk_Line: rode_sign, //人行横道"   绘制 不用模型
  Crosswalk_Warning_Line: rode_sign + 'Crosswalk_Warning_Line.fbx', //人行横道预告标识线"
  Maximum_RoadSurface_Speed_Limit_30: rode_sign + 'Maximum_RoadSurface_Speed_Limit_30.fbx', //路面最高限速30"
  Mesh_Line: rode_sign + 'Mesh_Line.fbx', //网状线"
  Minimum_RoadSurface_Speed_Limit_30: rode_sign + 'Minimum_RoadSurface_Speed_Limit_30.fbx', //路面最低限速30"
  No_Left_Turn_LandMark: rode_sign + 'No_Left_Turn_LandMark.fbx', //禁止左转"
  No_Right_Turn_LandMark: rode_sign + 'No_Right_Turn_LandMark.fbx', //禁止右转"
  No_U_Turn_LandMark: rode_sign + 'No_U_Turn_LandMark.fbx', //禁止掉头"
  Non_Motor_Vehicle: rode_sign + 'Non_Motor_Vehicle.fbx', //非机动车标线"
  RailwayCrossingMarking: rode_sign + 'RailwayCrossingMarking.fbx', //铁路平交道口标线"
  Rhombus_Center_Circle: rode_sign + 'Rhombus_Center_Circle.fbx', //菱形中心圈"
  School_Area: rode_sign + 'School_Area.fbx', //学校区域"
  // Slow_Down_To_Give_Way: rode_sign + 'Slow_Down_To_Give_Way.fbx', //减速让行线" 用图片了
  Slow_down_to_give_way_InvertedTriangleSign: rode_sign + 'Slow_down_to_give_way_InvertedTriangleSign.fbx', //减速让行线-倒三角"
  Small_Cars_Lane_Line: rode_sign + 'Small_Cars_Lane_Line.fbx', //小型车专用车道线"
  // Stop_Line: rode_sign + 'Stop_Line.fbx', //停止线"  用图片了
  // Stop_To_Give_Way: rode_sign + 'Stop_To_Give_Way.fbx', //停止让行线" 用图片了
  Stop_to_give_way_StopSign: rode_sign + 'Stop_to_give_way_StopSign.fbx', //停车让行线-停"
  Tide_Lane: rode_sign + 'Tide_Lane.fbx', //潮汐车道"
  Turn_And_Merge_Left: rode_sign + 'Turn_And_Merge_Left.fbx', //左弯合流"
  Turn_And_Merge_Right: rode_sign + 'Turn_And_Merge_Right.fbx', //右弯合流"
  Turn_Left_Waiting: rode_sign + 'Turn_Left_Waiting.fbx', //左弯待转区线"
  U_Turns: rode_sign + 'U_Turns.fbx', //掉头"
  // ----------------------------------------------------------------------------------------------object 54 个   物体 name
  Asphalt_Line: obj_model + 'Asphalt_Line.fbx', // 沥青线"
  // Bridge: obj_model, // 桥梁  没做
  Building: obj_model + 'Building.fbx', // 建筑物"
  Bus_Stop: obj_model + 'Bus_Stop.fbx', // 公交车站"
  Bus_Stop_2: obj_model + 'Bus_Stop_2.fbx', // 公交车站"
  Bus_Stop_3: obj_model + 'Bus_Stop_3.fbx', // 公交车站"
  Bus_Stop_4: obj_model + 'Bus_Stop_4.fbx', // 公交车站"
  Bus_Stop_5: obj_model + 'Bus_Stop_5.fbx', // 公交车站"
  Camera: obj_model + 'Camera.fbx', // 摄像头"
  Cantilever_Pole: obj_model + 'Cantilever_Pole.fbx', // 悬臂式柱"
  Charging_Station: obj_model + 'Charging_Station.fbx', // 充电桩"
  Collision_Resistant_Barrel: obj_model + 'Collision_Resistant_Barrel.fbx', // 防撞桶"
  Crack: obj_model + 'Crack.fbx', // 裂缝"
  // CustomParkingSpace: obj_model, // 自定义停车位"  代码实现
  Deceleration_Zone: obj_model + 'Deceleration_Zone.fbx', // 减速带"
  EmergencyMedicalServiceStation: obj_model + 'EmergencyMedicalServiceStation.fbx', // 急救站"
  FireHydrant: obj_model + 'FireHydrant.fbx', // 消防栓"
  FireStation: obj_model + 'FireStation.fbx', // 消防队"
  GarbageCan: obj_model + 'GarbageCan.fbx', // 垃圾桶"
  Gas_Station: obj_model + 'Gas_Station.fbx', // 加油站"
  Grass: obj_model + 'Grass.fbx', // 草坪"
  Ground_Lock: obj_model + 'Ground_Lock.fbx', // 地锁"
  Hospital: obj_model + 'Hospital.fbx', // 医院"
  Lamp: obj_model + 'Lamp.fbx', // 路灯"
  ManholeCover: obj_model + 'ManholeCover.fbx', // 井盖"
  Market: obj_model + 'Market.fbx', // 集市"
  Millimeter_Wave_Radar: obj_model + 'Millimeter_Wave_Radar.fbx', // 毫米波雷达"
  Obstacle: obj_model + 'Obstacle.fbx', // 障碍物"
  Oil_Stain: obj_model + 'Oil_Stain.fbx', // 油渍"
  // Parking_5m: obj_model + 'Parking_5m.fbx', // 5米停车位" 代码实现
  // Parking_6m: obj_model + 'Parking_6m.fbx', // 6米停车位" 代码实现
  // Parking_45deg: obj_model + 'Parking_45deg.fbx', // 45°停车位" 代码实现
  // Parking_60deg: obj_model + 'Parking_60deg.fbx', // 60°停车位" 代码实现
  Parking_Hole: obj_model + 'Parking_Hole.fbx', // 停车杆"
  Parking_Limit_Position_Pole_2m: obj_model + 'Parking_Limit_Position_Pole_2m.fbx', // 限位杆"
  Parking_Lot: obj_model + 'Parking_Lot.fbx', // 停车桩"
  Parking_StructurePillar: obj_model + 'Parking_StructurePillar.fbx', // 停车库柱子"
  Patch: obj_model + 'Patch.fbx', // 补丁"
  Pillar_Pole_3m: obj_model + 'Pillar_Pole_3m.fbx', // 3米柱"
  Pillar_Pole_6m: obj_model + 'Pillar_Pole_6m.fbx', // 6米柱"
  Plastic_Vehicle_Stopper: obj_model + 'Plastic_Vehicle_Stopper.fbx', // 塑胶挡车器"
  Pothole: obj_model + 'Pothole.fbx', // 坑洼"
  Protrusion: obj_model + 'Protrusion.fbx', // 凸起"
  Reflective_Road_Sign: obj_model + 'Reflective_Road_Sign.fbx', // 反光路标"
  ResidentialCommunity: obj_model + 'ResidentialCommunity.fbx', // 居民小区"
  Road_Curb: obj_model + 'Road_Curb.fbx', // 路沿"
  Rut_Track: obj_model + 'Rut_Track.fbx', // 车轮痕迹"
  School: obj_model + 'School.fbx', // 学校"
  Shrub: obj_model + 'Shrub.fbx', // 灌木"
  Snow_Cover: obj_model + 'Snow_Cover.fbx', // 积雪"
  Stagnant_Water: obj_model + 'Stagnant_Water.fbx', // 积水"
  Support_Vehicle_Stopper: obj_model + 'Support_Vehicle_Stopper.fbx', // 支撑型挡车器"
  Toll: obj_model + 'Toll.fbx', // 收费站"
  StartingPoint: obj_model + 'StartingPoint.fbx', // 起点"
  Traffic_Barrier: obj_model + 'Traffic_Barrier.fbx', // 交通护栏"
  Traffic_Bucket: obj_model + 'Traffic_Bucket.fbx', // 交通桶"
  Tree: obj_model + 'Tree.fbx', // 树木"
  Tunnel: obj_model + 'Tunnel.fbx', // 隧道"
  // Tunnel_door: obj_model + 'Tunnel_door.fbx', // 隧道"
  UnderGroundParking_GateUp: obj_model + 'UnderGroundParking_GateUp.fbx', // 地库抬杆"
  Traffic_Cone: obj_model + 'Traffic_Cone.fbx',
  Water_Bollard: obj_model + 'Water_Bollard.fbx', // 水马"
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
export const FBX_URL: any = {
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