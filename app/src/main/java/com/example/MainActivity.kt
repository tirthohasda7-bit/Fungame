package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
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

import java.io.File

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    cleanupCorruptedSeedFiles()
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

  private fun cleanupCorruptedSeedFiles() {
    try {
      val webviewDir = File(dataDir, "app_webview")
      if (webviewDir.exists()) {
        val seedFiles = listOf("variations_seed", "variations_seed_new", "variations_stamp")
        for (name in seedFiles) {
          val f = File(webviewDir, name)
          if (f.exists() && f.length() == 0L) {
            f.delete()
          }
        }
      }
    } catch (e: Exception) {
      Log.d("BanglaFunGames", "Seed cleanup skipped: ${e.message}")
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
      val currentUrl = wv.url ?: ""
      // If user navigated into about.html, contact.html, etc., go back to index.html
      if (!currentUrl.endsWith("index.html") && wv.canGoBack()) {
        wv.goBack()
      } else {
        wv.evaluateJavascript(
          "if (typeof currentView !== 'undefined' && currentView !== 'home') { navigateTo('home'); 'navigated'; } else { 'stay'; }"
        ) { res ->
          if (res?.contains("navigated") != true && wv.canGoBack()) {
            wv.goBack()
          }
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
          override fun shouldOverrideUrlLoading(
            view: WebView?,
            request: WebResourceRequest?
          ): Boolean {
            val url = request?.url?.toString() ?: return false
            // Handle email links safely without crashing WebView
            if (url.startsWith("mailto:") || url.startsWith("tel:")) {
              try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                view?.context?.startActivity(intent)
              } catch (e: Exception) {
                Log.w("BanglaFunGames", "No application found to handle: $url", e)
              }
              return true
            }
            // Allow in-app asset navigation
            if (url.startsWith("file:///android_asset/")) {
              return false
            }
            // Handle external web links in external browser
            if (url.startsWith("http://") || url.startsWith("https://")) {
              try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                view?.context?.startActivity(intent)
                return true
              } catch (e: Exception) {
                Log.w("BanglaFunGames", "Failed to launch browser for: $url", e)
              }
            }
            return false
          }

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
