@echo off
setlocal
set "JAVA_HOME=C:\Java\jdk-17.0.18"
set "GRADLE_USER_HOME=C:\Projects\DevFeed\.gradle"
set "HOME=C:\Projects\DevFeed\.gradle"
set "USERPROFILE=C:\Projects\DevFeed\.gradle"
set "TMP=C:\Projects\DevFeed\.gradle-temp"
set "TEMP=C:\Projects\DevFeed\.gradle-temp"
rem set "JAVA_TOOL_OPTIONS=-Duser.home=C:\Projects\DevFeed\.gradle -Djava.io.tmpdir=C:\Projects\DevFeed\.gradle-temp"
echo Using JAVA_HOME=%JAVA_HOME%
echo Using GRADLE_USER_HOME=%GRADLE_USER_HOME%
echo Using HOME=%HOME%
echo Using USERPROFILE=%USERPROFILE%
echo Using JAVA_TOOL_OPTIONS=%JAVA_TOOL_OPTIONS%
cd /d "%~dp0"
call gradlew.bat --no-daemon assembleRelease --stacktrace
endlocal
