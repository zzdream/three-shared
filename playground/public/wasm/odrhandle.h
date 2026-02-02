#ifndef ODRHANDLE_H
#define ODRHANDLE_H

#include <iostream>

#include "map/mapinfo.h"
#include "map/mapcalculation.h"
#include "map/xodrmapparser.h"
#include "map/jsontranslator.h"

using namespace std;

namespace OpenDrive
{
extern "C"
{
/**
 * @brief getXodrData           根据xodr文件获取渲染数据（文件内容写入内存）
 * @input  param strFilePath    xodr文件本地地址
 * @input  param dStep          轮廓点计算步长
 * @return                      返回渲染数据的Json格式字符串
 */
const char* getXodrData(const char* strFilePath, const double dStep);

/**
 * @brief getRoadInfo       根据xy坐标获取RoadPos和LanePos信息
 * @input  param strRoadID  道路ID
 * @input  param dX         x坐标
 * @input  param dY         y坐标
 * @return                  返回s坐标/t坐标/车道ID/偏移offset/hdg Json格式字符串
 */
const char* getRoadInfo(const char* strRoadID, const double dX, const double dY);

/**
 * @brief getWorldPosFromRoadPos    根据RoadPos获取WorldPos信息
 * @input  param strRoadID          道路ID
 * @input  param dS                 s坐标
 * @input  param dT                 t坐标
 * @return                          返回xy坐标/hdg的Json格式字符串
 */
const char* getWorldPosFromRoadPos(const char* strRoadID, const double dS, const double dT);

/**
 * @brief getWorldPosFromLanePos    根据LanePos获取WorldPos信息
 * @param strRoadID                 道路ID
 * @param iLaneID                   车道ID
 * @param dS                        s坐标
 * @param dOffset                   offset偏移
 * @return                          返回xy坐标/hdg的Json格式字符串
 */
const char* getWorldPosFromLanePos(const char* strRoadID, const int iLaneID, const double dS, const double dOffset);

/**
 * @brief getSumOfRoadLengths   计算所有道路长度之和（文件内容不写入内存）
 * @input  param strFilePath    xodr文件地址
 * @return                      所有道路长度之和
 */
double getSumOfRoadLengths(const char* strFilePath/*, double &dSum*/);
}
}

#endif // ODRHANDLE_H
