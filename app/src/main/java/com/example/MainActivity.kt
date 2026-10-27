package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    try {
      WebView.setDataDirectorySuffix("bfg_app")
    } catch (_: Exception) {
      // Suffix already set or not supported
    }
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D0C1D))
            .systemBarsPadding()
            .imePadding()
        ) {
          BanglaFunGamesApp()
        }
      }
    }
  }
}

private class WebViewHolder {
  var webView: WebView? = null
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun BanglaFunGamesApp() {
  val holder = remember { WebViewHolder() }

  BackHandler {
    holder.webView?.let { wv ->
      wv.evaluateJavascript(
        "if (typeof currentView !== 'undefined' && currentView !== 'home') { navigateTo('home'); 'navigated'; } else { 'stay'; }"
      ) { res ->
        if (res?.contains("navigated") != true && wv.canGoBack()) {
          wv.goBack()
        }
      }
    }
  }

  DisposableEffect(Unit) {
    onDispose {
      holder.webView?.let { wv ->
        wv.stopLoading()
        wv.destroy()
        holder.webView = null
      }
    }
  }

  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        setBackgroundColor(android.graphics.Color.parseColor("#0D0C1D"))
        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          useWideViewPort = true
          loadWithOverviewMode = true
          allowFileAccess = true
          allowContentAccess = true
          mediaPlaybackRequiresUserGesture = false
          mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
          cacheMode = WebSettings.LOAD_DEFAULT
        }
        webViewClient = object : WebViewClient() {
          override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
          ) {
            super.onReceivedError(view, request, error)
            Log.w("BanglaFunGames", "WebView error: ${error?.description}")
          }
        }
        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            Log.d(
              "BanglaFunGames",
              "${consoleMessage?.message()} [${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()}]"
            )
            return true
          }
        }
        loadUrl("file:///android_asset/index.html")
        holder.webView = this
      }
    },
    update = { wv ->
      holder.webView = wv
    }
  )
}
