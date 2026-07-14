import type { FieldError, FieldErrors, FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

/**
 * 제출 시 유효하지 않은 모든 필드를 동시에 표시하는 대신,
 * fieldOrder 순서상 가장 먼저 나오는 필드 하나의 에러만 남기고 포커스한다.
 */
export function focusFirstInvalidField<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fieldOrder: readonly FieldPath<TFieldValues>[],
  errors: FieldErrors<TFieldValues>
) {
  const firstInvalidField = fieldOrder.find((name) => errors[name])
  if (!firstInvalidField) return

  const firstError = errors[firstInvalidField] as FieldError | undefined
  form.clearErrors()
  form.setError(firstInvalidField, {
    type: firstError?.type ?? "manual",
    message: firstError?.message,
  })
  form.setFocus(firstInvalidField)
}
