package com.devfeedmobile;

import android.app.Application;
import android.content.res.Configuration;
import androidx.annotation.NonNull;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
    new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {
      @Override
      public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
      }

      @Override
      protected List<ReactPackage> getPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        // Remove duplicate autolinked packages to avoid duplicate native module registrations.
        return dedupePackages(packages);
      }

      private List<ReactPackage> dedupePackages(List<ReactPackage> packages) {
        List<ReactPackage> dedupedPackages = new ArrayList<>();
        Set<Class<?>> seenPackageClasses = new HashSet<>();
        for (ReactPackage reactPackage : packages) {
          if (!seenPackageClasses.contains(reactPackage.getClass())) {
            seenPackageClasses.add(reactPackage.getClass());
            dedupedPackages.add(reactPackage);
          }
        }
        return dedupedPackages;
      }

      @Override
      protected String getJSMainModuleName() {
        return ".expo/.virtual-metro-entry";
      }

      @Override
      protected boolean isNewArchEnabled() {
        return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      }

      @Override
      protected Boolean isHermesEnabled() {
        return BuildConfig.IS_HERMES_ENABLED;
      }
  });

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    boolean schedulerAlways = false;
    try {
      java.lang.reflect.Field f = BuildConfig.class.getField("REACT_NATIVE_UNSTABLE_USE_RUNTIME_SCHEDULER_ALWAYS");
      schedulerAlways = f.getBoolean(null);
    } catch (Exception ignored) {
      // Field might not exist on some RN versions; default to false
    }
    if (!schedulerAlways) {
      ReactFeatureFlags.unstable_useRuntimeSchedulerAlways = false;
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    if (BuildConfig.DEBUG) {
      ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }
    try {
      ApplicationLifecycleDispatcher.onApplicationCreate(this);
    } catch (IllegalStateException ignored) {
      // DevLauncher/DevClient may already be initialized in some environments;
      // ignore to avoid crashing the app on startup.
    }
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }
}
