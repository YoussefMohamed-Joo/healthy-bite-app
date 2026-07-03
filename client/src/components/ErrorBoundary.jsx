import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9F8] p-6" style={{ direction: 'rtl' }}>
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-[#666666] mb-6 text-sm leading-relaxed">
              حدث خطأ أثناء تحميل الصفحة. حاول تحديث الصفحة أو العودة للصفحة الرئيسية.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] transition-colors cursor-pointer"
              >
                تحديث الصفحة
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
                className="px-6 py-3 border-2 border-[#237C3C] text-[#237C3C] rounded-xl text-sm font-bold hover:bg-[#237C3C] hover:text-white transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
