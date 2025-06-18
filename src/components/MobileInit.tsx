'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export function MobileInit() {
  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // ステータスバーの設定
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#000000' });

          // キーボードの設定
          Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-is-open');
          });

          Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-is-open');
          });

          // スプラッシュスクリーンを隠す
          await SplashScreen.hide();
        } catch (error) {
          console.error('Mobile initialization error:', error);
        }
      }
    };

    initializeApp();

    return () => {
      if (Capacitor.isNativePlatform()) {
        Keyboard.removeAllListeners();
      }
    };
  }, []);

  return null;
}
