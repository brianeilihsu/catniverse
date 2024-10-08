package com.catniverse.backend.service.forbidden;

import net.sourceforge.pinyin4j.PinyinHelper;
import org.springframework.stereotype.Service;

@Service
public class ForbiddenService implements ImpForbiddenService{

    private static final String[] FORBIDDEN_WORDS = {
            "號翔", "豪祥"// 可以繼續添加更多禁用字詞
    };

    @Override
    public boolean check(String content) {
        for(String forbiddenWord : FORBIDDEN_WORDS){
            if(isHomophonic(content, forbiddenWord)){
                return true;
            }
        }
        return false;
    }
    private boolean isHomophonic(String input, String forbiddenWord) {
        String inputPinyin = convertToPinyin(input);
        String forbiddenPinyin = convertToPinyin(forbiddenWord);

        return inputPinyin.contains(forbiddenPinyin);
    }

    // 將字串轉換為拼音
    private String convertToPinyin(String chinese) {
        StringBuilder pinyin = new StringBuilder();
        for (int i = 0; i < chinese.length(); i++) {
            String[] pinyins = PinyinHelper.toHanyuPinyinStringArray(chinese.charAt(i));
            if (pinyins != null && pinyins.length > 0) {
                pinyin.append(pinyins[0]); // 取首個拼音作為標準
            }
        }
        return pinyin.toString();
    }



}
