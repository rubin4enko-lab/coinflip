/* Голосовой ввод через Web Speech API */
const Voice = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let running = false;

  function explain(code) {
    switch (code) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Нет доступа к микрофону или распознаванию речи. Разреши доступ в настройках Safari или продиктуй вопрос кнопкой 🎙 на клавиатуре iPhone.';
      case 'no-speech':
        return 'Ничего не услышал. Попробуй ещё раз.';
      case 'audio-capture':
        return 'Микрофон не найден.';
      case 'network':
        return 'Для распознавания речи нужен интернет.';
      case 'aborted':
        return '';
      default:
        return 'Не удалось распознать речь. Можно продиктовать вопрос кнопкой 🎙 на клавиатуре.';
    }
  }

  return {
    supported: !!SR,
    active: () => running,

    start({ onText, onEnd, onError }) {
      let finalText = '';
      let last = '';
      let errored = false;

      rec = new SR();
      rec.lang = 'ru-RU';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        last = (finalText + interim).trim();
        onText(last);
      };

      rec.onerror = (e) => {
        errored = true;
        const msg = explain(e.error);
        if (msg) onError(msg);
      };

      rec.onend = () => {
        running = false;
        rec = null;
        onEnd(errored ? '' : (finalText || last).trim());
      };

      try {
        running = true;
        rec.start();
      } catch (err) {
        running = false;
        rec = null;
        onError('Не удалось запустить микрофон.');
        onEnd('');
      }
    },

    stop() {
      if (rec) { try { rec.stop(); } catch (e) { /* ignore */ } }
    }
  };
})();
