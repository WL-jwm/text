/**
 * 拆分自 App.tsx — 路由页面懒加载声明
 */

import React from 'react';

export const Overview = React.lazy(() => import('../pages/Overview').then(m => ({ default: m.Overview })));
export const Resources = React.lazy(() => import('../pages/Resources').then(m => ({ default: m.Resources })));
export const WaterQuality = React.lazy(() => import('../pages/WaterQuality').then(m => ({ default: m.WaterQuality })));
export const Environment = React.lazy(() => import('../pages/Environment').then(m => ({ default: m.Environment })));
export const Exploitation = React.lazy(() => import('../pages/Exploitation').then(m => ({ default: m.Exploitation })));
export const Hydrochemistry = React.lazy(() => import('../pages/Hydrochemistry').then(m => ({ default: m.Hydrochemistry })));
export const Geology = React.lazy(() => import('../pages/Geology').then(m => ({ default: m.Geology })));
export const HydroZoneParams = React.lazy(() => import('../pages/HydroZoneParams').then(m => ({ default: m.HydroZoneParams })));
export const WaterSource = React.lazy(() => import('../pages/WaterSource').then(m => ({ default: m.WaterSource })));
export const Geothermal = React.lazy(() => import('../pages/Geothermal').then(m => ({ default: m.Geothermal })));
export const MineralWater = React.lazy(() => import('../pages/MineralWater').then(m => ({ default: m.MineralWater })));
export const SalineWater = React.lazy(() => import('../pages/SalineWater').then(m => ({ default: m.SalineWater })));
export const SalineSoil = React.lazy(() => import('../pages/SalineSoil').then(m => ({ default: m.SalineSoil })));
export const MineHydrogeology = React.lazy(() => import('../pages/MineHydrogeology').then(m => ({ default: m.MineHydrogeology })));
export const KarstWater = React.lazy(() => import('../pages/KarstWater').then(m => ({ default: m.KarstWater })));
export const FractureWater = React.lazy(() => import('../pages/FractureWater').then(m => ({ default: m.FractureWater })));
export const SystemZoning = React.lazy(() => import('../pages/SystemZoning').then(m => ({ default: m.SystemZoning })));
export const Changelog = React.lazy(() => import('../pages/Changelog').then(m => ({ default: m.Changelog })));
export const NotFound = React.lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));
export const MapView = React.lazy(() => import('../pages/MapView').then(m => ({ default: m.MapView })));
export const DataInsight = React.lazy(() => import('../pages/DataInsight').then(m => ({ default: m.DataInsight })));
export const Workspace = React.lazy(() => import('../pages/Workspace').then(m => ({ default: m.Workspace })));
export const CountyWaterCompare = React.lazy(() => import('../pages/CountyWaterCompare').then(m => ({ default: m.CountyWaterCompare })));
export const GroundwaterFunction = React.lazy(() => import('../pages/GroundwaterFunction').then(m => ({ default: m.GroundwaterFunction })));
export const HydrogeologyHistorical = React.lazy(() => import('../pages/HydrogeologyHistorical').then(m => ({ default: m.HydrogeologyHistorical })));
export const GroundwaterBalance = React.lazy(() => import('../pages/GroundwaterBalance').then(m => ({ default: m.GroundwaterBalance })));
export const GroundwaterBackground = React.lazy(() => import('../pages/GroundwaterBackground').then(m => ({ default: m.GroundwaterBackground })));
export const TimeSeriesAnalysis = React.lazy(() => import('../pages/TimeSeriesAnalysis').then(m => ({ default: m.TimeSeriesAnalysis })));
export const SpatialAnalysis = React.lazy(() => import('../pages/SpatialAnalysis').then(m => ({ default: m.SpatialAnalysis })));
export const Visualization = React.lazy(() => import('../pages/Visualization').then(m => ({ default: m.Visualization })));
