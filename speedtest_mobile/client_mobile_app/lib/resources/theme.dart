import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';

final theme = ThemeData(
  appBarTheme: const AppBarTheme(
    backgroundColor: AppColors.paleLilac,
    titleTextStyle: TextStyle(
      color: AppColors.deepBlue,
      fontSize: 20.0,
      fontWeight: FontWeight.w600,
    ),
    elevation: 0,
  ),
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: AppColors.snow,
    selectedItemColor: AppColors.blue,
    unselectedItemColor: AppColors.darkLavender,
    selectedIconTheme: const IconThemeData(color: AppColors.blue),
    unselectedIconTheme: const IconThemeData(color: AppColors.darkLavender),
    unselectedLabelStyle: AppTextStyle(
      fontSize: 11.0,
      fontWeight: 700,
    ),
    selectedLabelStyle: AppTextStyle(
      fontSize: 11.0,
      fontWeight: 700,
    ),
  ),
  colorScheme: const ColorScheme(
    primary: AppColors.deepBlue,
    secondary: AppColors.blue,
    tertiary: AppColors.darkLavender,
    surface: AppColors.lightGrey,
    background: AppColors.paleLilac,
    error: AppColors.error,
    onPrimary: AppColors.snow,
    onSecondary: AppColors.snow,
    onTertiary: AppColors.deepBlue,
    onSurface: AppColors.deepBlue,
    onBackground: AppColors.deepBlue,
    onError: AppColors.onError,
    brightness: Brightness.light,
  ),
  textButtonTheme: TextButtonThemeData(
    style: ButtonStyle(
      foregroundColor: MaterialStateProperty.resolveWith<Color?>(
        (Set<MaterialState> states) {
          if (states.contains(MaterialState.focused)) return AppColors.darkLavender;
          if (states.contains(MaterialState.pressed)) return AppColors.darkLavender;
          if (states.contains(MaterialState.disabled)) return AppColors.darkLavender.withOpacity(0.5);
          return AppColors.darkLavender;
        },
      ),
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ButtonStyle(
      textStyle: MaterialStateProperty.resolveWith<TextStyle?>(
        (Set<MaterialState> states) => const TextStyle(
          fontSize: 16.0,
          fontWeight: FontWeight.bold,
          color: AppColors.snow,
        ),
      ),
      foregroundColor: MaterialStateProperty.all<Color?>(AppColors.snow),
      backgroundColor: MaterialStateProperty.resolveWith<Color?>(
        (Set<MaterialState> states) {
          if (states.contains(MaterialState.focused)) return AppColors.blue;
          if (states.contains(MaterialState.pressed)) return AppColors.blue;
          if (states.contains(MaterialState.disabled)) return AppColors.blue.withOpacity(0.3);
          return AppColors.blue;
        },
      ),
      shape: MaterialStateProperty.all<OutlinedBorder?>(
          const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(24.0)))),
    ),
  ),
  fontFamily: 'Mulish',
  textTheme: const TextTheme(
    headline1: TextStyle(fontSize: 22.0, fontWeight: FontWeight.w800, color: AppColors.deepBlue),
    headline2: TextStyle(fontSize: 20.0, fontWeight: FontWeight.w800, color: AppColors.deepBlue),
    subtitle1: TextStyle(fontSize: 16.0, fontWeight: FontWeight.normal, color: AppColors.darkLavender),
    bodyText1: TextStyle(fontSize: 15.0, fontWeight: FontWeight.normal, color: AppColors.darkGrey),
    bodyText2: TextStyle(fontSize: 15.0, fontWeight: FontWeight.bold, color: AppColors.deepBlue),
  ),
);
