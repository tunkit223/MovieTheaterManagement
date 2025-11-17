package com.theatermgnt.theatermgnt.combo.dto.request;


import com.theatermgnt.theatermgnt.combo.entity.Combo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ComboItemCreationRequest {

    @Size(min = 3, message = "COMBO_ITEM_NAME_INVALID")
    String name;

    @NotBlank
    String comboId;

    @NotNull
    Integer quantity;
}
